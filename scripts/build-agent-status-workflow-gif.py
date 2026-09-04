from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
root=Path(__file__).resolve().parents[1]
src=root/'.screenshots/source/agent-status-workflow-20260905/captures'
out=root/'docs/images/yumeno-agent-status-workflow.gif'
W,H=1600,980; chrome=54
files=sorted(src.glob('*.png'))
frames=[]
for path in files:
    with Image.open(path) as im: content=im.convert('RGB')
    maxw,maxh=W-48,H-48-chrome; scale=min(maxw/content.width,maxh/content.height); content=content.resize((round(content.width*scale),round(content.height*scale)),Image.Resampling.LANCZOS)
    fw,fh=content.width,content.height+chrome; canvas=Image.new('RGB',(W,H),(232,237,242)); x,y=(W-fw)//2,(H-fh)//2
    shadow=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(shadow).rounded_rectangle((x+8,y+12,x+fw+8,y+fh+12),radius=16,fill=(0,0,0,58)); canvas=Image.alpha_composite(canvas.convert('RGBA'),shadow.filter(ImageFilter.GaussianBlur(12)))
    browser=Image.new('RGB',(fw,fh),'white'); d=ImageDraw.Draw(browser); d.rounded_rectangle((0,0,fw-1,fh-1),radius=16,fill='white',outline='#c8d2dc',width=1); d.rectangle((0,0,fw,chrome),fill='#edf2f6')
    for a,z in ((18,'#ff6b6b'),(38,'#ffd166'),(58,'#5bd68b')): d.ellipse((a,19,a+12,31),fill=z)
    d.rounded_rectangle((102,13,fw-24,41),radius=14,fill='#dfe7ee'); d.text((120,19),'127.0.0.1:17000  ·  YUMENO',fill='#536579'); browser.paste(content,(0,chrome)); canvas.paste(browser,(x,y)); frames.append(canvas.convert('P',palette=Image.Palette.ADAPTIVE,colors=192))
frames[0].save(out,save_all=True,append_images=frames[1:],duration=[3400,3400,4500],loop=0,optimize=False,disposal=2)
print(out, out.stat().st_size, len(frames))
