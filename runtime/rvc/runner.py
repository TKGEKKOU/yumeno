from pathlib import Path
import os, sys
requested = os.environ.get('YUMENO_RVC_DEVICE', 'cuda').strip().lower()
if requested in {'cuda', 'gpu'}:
    import torch
    if not torch.cuda.is_available():
        raise RuntimeError('YUMENO_RVC_DEVICE=cuda but CUDA is unavailable; refusing CPU fallback')
core = Path(os.environ['YUMENO_RVC_CORE_DIR']).resolve()
os.chdir(core)
sys.path.insert(0, str(core))
from infer import hubert
hubert.HUBERT_MODEL_PATH = Path(os.environ['YUMENO_RVC_HUBERT_DIR']).resolve()
from infer.cli import main
raise SystemExit(main())
