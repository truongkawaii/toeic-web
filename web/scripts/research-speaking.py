"""Discover candidate videos on their original YouTube pages for editorial review.

Caches metadata in /tmp, never downloads videos or transcripts, and never changes the live catalog.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import quote
import importlib.util
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
CACHE = Path('/tmp/toeic-speaking-research')
CACHE.mkdir(exist_ok=True)
spec = importlib.util.spec_from_file_location('verify_speaking', Path(__file__).with_name('verify-speaking.py'))
verifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)

def crawl(url):
    return subprocess.run(['curl','-f','-L','-sS','--retry','1','--max-time','25',url],capture_output=True,text=True,check=True).stdout

def walk(value):
    if isinstance(value, dict):
        if 'videoRenderer' in value:
            yield value['videoRenderer']
        for child in value.values():
            yield from walk(child)
    elif isinstance(value,list):
        for child in value:
            yield from walk(child)

def text(value):
    return value.get('simpleText') or ''.join(run.get('text','') for run in value.get('runs',[]))

def search(config):
    cache = CACHE / ('search-'+config['id']+'.json')
    if cache.exists():
        return json.loads(cache.read_text())
    html = crawl('https://www.youtube.com/results?search_query='+quote(config['query']))
    match = re.search(r'ytInitialData\s*=\s*',html)
    if not match:
        raise ValueError('No search metadata: '+config['id'])
    data = json.JSONDecoder().raw_decode(html[match.end():])[0]
    candidates=[]
    for item in walk(data):
        title=text(item.get('title',{}))
        source=text(item.get('ownerText',{}))
        duration=text(item.get('lengthText',{}))
        if source not in config['sources'] or not re.fullmatch(r'\d{1,2}:\d{2}',duration):
            continue
        minutes,seconds=map(int,duration.split(':'))
        seconds=minutes*60+seconds
        if not config.get('min',30)<=seconds<900:
            continue
        if re.search(config.get('reject','a^'),title,re.I):
            continue
        if config.get('require') and not re.search(config['require'],title,re.I):
            continue
        candidates.append(dict(id=item['videoId'],videoId=item['videoId'],category=config['category'],collection=config['collection'],
                               accent=config['accent'],level=config['level'],expectedSource=source,
                               goal=config['goal'],practicePrompt=config['practicePrompt'],
                               discoveredTitle=title,searchDurationSeconds=seconds,queryId=config['id']))
    cache.write_text(json.dumps(candidates,ensure_ascii=False,indent=2))
    print(config['id']+': '+str(len(candidates)),flush=True)
    return candidates

def checked(item):
    cache = CACHE / ('video-'+item['id']+'.json')
    try:
        if cache.exists():
            result=json.loads(cache.read_text())
            if result.get('error'):
                return None,result['error']
            return {**item, **{key:result[key] for key in ['title','source','sourceUrl','durationSeconds','verifiedAt','captionLanguages','embedAllowed']},
                    **({'verificationMethod': result['verificationMethod']} if result.get('verificationMethod') else {})}, None
        result=verifier.verify(item)
        cache.write_text(json.dumps(result,ensure_ascii=False,indent=2))
        print('OK '+item['category']+' '+str(result['durationSeconds'])+'s '+result['title'],flush=True)
        return result,None
    except Exception as error:
        cache.write_text(json.dumps({'error':str(error)},ensure_ascii=False))
        print('SKIP '+item['id']+' '+str(error),flush=True)
        return None,str(error)

def main():
    config=json.loads((ROOT/'docs/speaking/research-queries.json').read_text())
    if sys.argv[1:]==['search']:
        def safe_search(item):
            try:
                return search(item)
            except Exception as error:
                print('SEARCH SKIP '+item['id']+' '+str(error),flush=True)
                return []
        with ThreadPoolExecutor(max_workers=8) as pool:
            groups=list(pool.map(safe_search,config))
        unique={}
        for group in groups:
            for item in group:
                unique.setdefault(item['id'],item)
        (CACHE/'candidates.json').write_text(json.dumps(list(unique.values()),ensure_ascii=False,indent=2))
        from collections import Counter
        print('Candidates:',Counter(item['category'] for item in unique.values()))
    elif sys.argv[1:]==['verify']:
        candidates=json.loads((CACHE/'candidates.json').read_text())
        current=json.loads((ROOT/'web/src/lib/speaking-content.json').read_text())
        for item in current:
            (CACHE/('video-'+item['id']+'.json')).write_text(json.dumps(item,ensure_ascii=False))
        # Exclude already published videos from candidate pool: additions must be genuinely new.
        ids={item['id'] for item in current}
        candidates=[item for item in candidates if item['id'] not in ids]
        with ThreadPoolExecutor(max_workers=8) as pool:
            results=list(pool.map(checked,candidates))
        videos=[video for video,error in results if video]
        (CACHE/'verified-candidates.json').write_text(json.dumps(videos,ensure_ascii=False,indent=2))
        from collections import Counter
        print('Verified candidates:',Counter(item['category'] for item in videos))
    else:
        raise SystemExit('Usage: research-speaking.py search|verify')

if __name__=='__main__':
    main()
