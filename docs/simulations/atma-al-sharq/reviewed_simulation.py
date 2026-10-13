"""Reproducible planning calculations; outputs are predictions, not field measurements.

Run with Python 3, numpy and matplotlib. Exact site coordinates are not used or exported.
profiles.json is the existing 61-point-per-hop terrain dataset. See README.md for limitations.
"""
import csv
import json
import math
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

HERE = Path(__file__).parent
MEDIA = HERE.parents[2] / 'public/projects/proj-wireless-link-planning/media'
FREQUENCY = 5800
SENS = [-96,-95,-92,-90,-86,-83,-77,-74,-95,-93,-90,-87,-84,-79,-78,-75]
RADIOS = {
 'H1': {'name':'PowerBeam M5 400','gain':25,'tx':[26,25,25,25,24,23,23,23,26,25,25,25,24,23,23,23], 'feed_loss':0},
 'H2': {'name':'Rocket M5 + RD-5G34','gain':34,'tx':[27,27,27,27,26,24,22,21,27,27,27,27,26,24,22,21], 'feed_loss':0.5},
}
RATE = [6.5,13,19.5,26,39,52,58.5,65,13,26,39,52,78,104,117,130]
PARAMS = {'frequency_mhz':FREQUENCY,'channel_mhz':20,'guard_interval':'800 ns',
 'extra_loss_db':2,'target_margin_db':10,'payload_efficiency_assumption':0.5,
 'reference_mast_m':6,'clutter_m':5,'k':4/3,'mc_runs':5000,'mc_seed':1234,
 'radio_tolerance_db':2,'eirp_caps_for_sensitivity_only_dbm':[36,40,44],
 'terrain_source':'Existing public Copernicus GLO-90 profile via Open-Meteo; 61 samples per hop',
 'status':'Planning model; no measured RSSI, spectrum, throughput or availability',
 'sources':{'powerbeam':'https://dl.ui.com/datasheets/powerbeam/PowerBeam_DS.pdf',
 'rocket':'https://dl.ui.com/datasheets/rocketm/RocketM_DS.pdf',
 'nanostation':'https://dl.ui.com/datasheets/nanostationm/nsm_ds_web.pdf'}}

def fspl(km, mhz=FREQUENCY):
 if km<=0 or mhz<=0: raise ValueError('Distance and frequency must be positive')
 return 32.44+20*math.log10(km)+20*math.log10(mhz)

def budget(h, cap=None):
 radio=RADIOS[h['id']]; rows=[]
 for m in range(16):
  tx=radio['tx'][m] if cap is None else min(radio['tx'][m],cap-radio['gain']+radio['feed_loss'])
  eirp=tx+radio['gain']-radio['feed_loss']
  rx=eirp+radio['gain']-radio['feed_loss']-fspl(h['distance_km'])-PARAMS['extra_loss_db']
  rows.append({'mcs':m,'streams':1 if m<8 else 2,'tx_dbm':tx,'eirp_dbm':eirp,
   'sensitivity_dbm':SENS[m],'rx_dbm':rx,'margin_db':rx-SENS[m],
   'margin_after_4db_tolerance':rx-SENS[m]-4,'phy_mbps':RATE[m],
   'payload_estimate_mbps':RATE[m]*0.5})
 candidates=[r for r in rows if r['margin_db']>=10]
 return {'rows':rows,'eirp_cap_dbm':cap,'highest_phy_with_10db_margin':max(candidates,key=lambda r:r['phy_mbps']) if candidates else None}

def profile(h, mast=6, k=4/3, clutter=5, error=None):
 terrain=np.asarray(h['elev'],float); D=h['distance_km']*1000
 x=np.linspace(0,D,len(terrain)); bulge=x*(D-x)/(2*k*6371000)
 f1=np.sqrt((299.792458/FREQUENCY)*x*(D-x)/D)
 los=terrain[0]+mast+(terrain[-1]-terrain[0])*x/D
 obstruction=terrain+bulge+clutter+(0 if error is None else error)
 ratios=(los[1:-1]-obstruction[1:-1])/f1[1:-1]
 worst=int(np.argmin(ratios))+1
 return {'x':x,'terrain':terrain,'los':los,'obstruction':obstruction,'f1':f1,
   'min_ratio':float(ratios[worst-1]),'critical_km':float(x[worst]/1000),
   'min_60pct_clearance_m':float(np.min((los-obstruction-0.6*f1)[1:-1]))}

def monte_carlo(h, mast):
 # This is a scenario sensitivity screen, not an observed failure probability.
 rng=np.random.default_rng(1234+(h['id']=='H2')); n=len(h['elev']); q=np.linspace(0,1,n)
 ratios=[]
 for _ in range(5000):
  smooth=rng.normal(0,6)*np.sin(2*np.pi*rng.uniform(.5,3)*q+rng.uniform(0,2*np.pi))
  err=np.sqrt(np.sin(np.pi*q))*(smooth+rng.normal(0,4,n));err[[0,-1]]=0
  ratios.append(profile(h,mast,np.clip(rng.normal(4/3,.25),.7,3),rng.uniform(0,15),err)['min_ratio'])
 a=np.asarray(ratios)
 return {'scenario_fraction_ge_60pct':float(np.mean(a>=.6)),
   'scenario_fraction_los_clear':float(np.mean(a>=0)), 'p5_ratio':float(np.quantile(a,.05)),
   'median_ratio':float(np.median(a))}

def chart(title, xlabel, ylabel, size=(10.6,5.8)):
 fig,ax=plt.subplots(figsize=size)
 fig.patch.set_facecolor('#f7f9fc');ax.set_facecolor('white')
 ax.set_title(title,loc='left',fontsize=16,pad=20,fontweight='bold',color='#13263c')
 ax.set_xlabel(xlabel);ax.set_ylabel(ylabel);ax.grid(alpha=.2)
 ax.spines[['top','right']].set_visible(False)
 fig.text(.08,.018,'COMPUTED PLANNING OUTPUT  |  Not a field measurement',fontsize=9,color='#526579')
 return fig,ax

def save(fig,name):
 fig.tight_layout(rect=(0,.055,1,1));fig.savefig(MEDIA/name,dpi=180);plt.close(fig)

def main():
 hops=json.loads((HERE/'profiles.json').read_text())['hops'];out={'inputs':PARAMS,'radios':RADIOS,'hops':{}}
 for h in hops:
  b=budget(h);p=profile(h);mc={str(m):monte_carlo(h,m) for m in [3,6,10,15,20]}
  out['hops'][h['id']]={'from':h['from'],'to':h['to'],'distance_km':h['distance_km'],
   'source_estimated_km':8.5 if h['id']=='H1' else 16.5,'sample_spacing_m':h['distance_km']*1000/60,
   'fspl_db':fspl(h['distance_km']),'midpoint_fresnel_m':math.sqrt((299.792458/FREQUENCY)*h['distance_km']*1000/4),
   'nominal_clearance_ratio':p['min_ratio'],'critical_km':p['critical_km'],
   'endpoint_ground_elevations_m':[h['elev'][0],h['elev'][-1]],'budget':b,
   'eirp_sensitivity':{str(cap):budget(h,cap) for cap in [36,40,44]},'mast_sensitivity':mc,
   'annual_availability':'Not calculated: local climate inputs and model applicability unverified'}
  fig,ax=chart(f"{h['id']}  {h['from']} to {h['to']}",'Distance along path (km)','Elevation (m AMSL)')
  ax.fill_between(p['x']/1000,p['terrain'],min(h['elev'])-50,color='#b8c5af',alpha=.75,label='DEM ground')
  ax.plot(p['x']/1000,p['obstruction'],color='#62754f',label='Ground + curvature + 5 m clutter')
  ax.plot(p['x']/1000,p['los'],color='#236bc2',lw=2,label='LOS: 6 m antennas')
  ax.fill_between(p['x']/1000,p['los']-.6*p['f1'],p['los']+.6*p['f1'],color='#51a7dd',alpha=.3,label='60% first Fresnel envelope')
  ax.set_ylim(min(h['elev'])-50,max(h['elev'])+100);ax.legend(fontsize=9,loc='lower left')
  ax.text(.02,.95,f"{h['distance_km']:.2f} km | 5.8 GHz | k = 4/3 | 61 terrain samples",transform=ax.transAxes,fontsize=10)
  save(fig,f"reviewed-{h['id'].lower()}-profile.png")
 fig,ax=chart('Backhaul margin at each actual MCS index','MCS index (0-7: one stream; 8-15: two streams)','Margin above sensitivity (dB)')
 for hid,col in [('H1','#236bc2'),('H2','#087b6f')]:
  ax.plot(range(16),[r['margin_db'] for r in out['hops'][hid]['budget']['rows']],'-o',color=col,label=RADIOS[hid]['name'])
 ax.axhline(10,color='#aa6a0a',ls='--',label='10 dB design screen');ax.set_xticks(range(16));ax.legend(fontsize=9)
 save(fig,'reviewed-mcs-margin.png')
 fig,ax=chart('Transmit EIRP changes the top-rate margin','Illustrative EIRP cap (dBm) - not a legal limit','MCS15 margin (dB)')
 caps=np.arange(30,57)
 for h,col in zip(hops,['#236bc2','#087b6f']):ax.plot(caps,[budget(h,int(c))['rows'][15]['margin_db'] for c in caps],color=col,lw=2,label=h['id'])
 ax.axhline(10,color='#aa6a0a',ls='--',label='10 dB design screen');ax.legend()
 save(fig,'reviewed-eirp-sensitivity.png')
 fig,ax=chart('Mast-height sensitivity at the sampled terrain points','Equal antenna height above ground at both ends (m)','Scenarios meeting 60% Fresnel clearance (%)')
 for hid,col in [('H1','#236bc2'),('H2','#087b6f')]:
  m=out['hops'][hid]['mast_sensitivity'];ax.plot([3,6,10,15,20],[100*m[str(i)]['scenario_fraction_ge_60pct'] for i in [3,6,10,15,20]],'-o',color=col,label=hid)
 ax.set_ylim(0,105);ax.legend();ax.text(.02,.08,'5,000 scenarios per height; assumed error and clutter distributions\nUnresolved buildings and terrain between samples are excluded.',transform=ax.transAxes,fontsize=9)
 save(fig,'reviewed-mast-sensitivity.png')
 # NSM2 to directional NSM2 clients; n=3.2 and sigma=8 dB are assumed, not fitted.
 cov={};d=np.arange(50,651,25)
 fig,ax=chart('Directional NSM2 cell sensitivity to distance','Distance from access point (m)','Scenario coverage probability (%)')
 for m,tx,col in [(0,28,'#087b6f'),(3,28,'#236bc2'),(15,22,'#aa6a0a')]:
  median=tx+22-1-(fspl(.001,2437)+32*np.log10(d));need=SENS[m]+10
  probs=[.5*math.erfc(-(r-need)/(8*math.sqrt(2))) for r in median]
  cov[f'mcs{m}']=[{'distance_m':int(x),'probability':p,'median_rx_dbm':float(r)} for x,p,r in zip(d,probs,median)]
  ax.plot(d,np.array(probs)*100,color=col,lw=2,label=f'MCS{m}')
 ax.axvline(500,color='#788899',ls='--',label='Source planned range');ax.set_ylim(0,105);ax.legend()
 ax.text(.03,.09,'On-axis, 11 dBi antennas at both ends; 2.437 GHz\nn = 3.2, shadowing sigma = 8 dB, 10 dB allowance; interference excluded',transform=ax.transAxes,fontsize=9)
 save(fig,'reviewed-cell-coverage.png');out['cell']=cov
 load=17.6;daily=load*24
 out['solar']={'load_w_assumed':load,'daily_wh':daily,'psh_assumed':4.5,'pv_w_with_margin':daily/(4.5*.7)*1.5,
 'autonomy_days':3,'battery_lifepo4_ah_12v':daily*3/(12*.8*.85),'battery_lead_ah_12v':daily*3/(12*.5*.85),
 'controller_a_at_recommended_pv':daily/(4.5*.7)*1.5*1.25/12,
 'poe_constraint':'12 V bank requires regulated 24 V compatible passive PoE; router and auxiliaries excluded'}
 out['uisp_runs']={'captured':'2026-10-12','mode':'Guest, manual product selection, Noise Free, 6 m antennas, 20 MHz',
  'H1':{'distance_km':8.31,'frequency_mhz':5000,'tx_dbm':26,'gain_dbi':25,'expected_rx_dbm':-49,'capacity_mbps':84.5,'device':'PowerBeam M5 400 pair'},
  'H2':{'distance_km':15.64,'frequency_mhz':5500,'tx_dbm':27,'gain_dbi':34,'expected_rx_dbm':-36,'capacity_mbps':84.5,'device':'Rocket M5 + RD-5G34 pair'},
  'note':'Vendor predictions use different frequency, terrain and loss assumptions; not acceptance measurements.'}
 (HERE/'reviewed-results.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
 with (HERE/'reviewed-budget.csv').open('w',newline='',encoding='utf-8') as fp:
  rows=[{'hop':hid,**row} for hid,h in out['hops'].items() for row in h['budget']['rows']]
  writer=csv.DictWriter(fp,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
 for hid,h in out['hops'].items():
  r=h['budget']['rows'][15];print(f"{hid}: {h['distance_km']:.2f} km, FSPL {h['fspl_db']:.2f} dB, MCS15 RX {r['rx_dbm']:.2f} dBm, margin {r['margin_db']:.2f} dB")
 print('Wrote reproducible JSON, CSV and six computed figures.')

if __name__=='__main__': main()
