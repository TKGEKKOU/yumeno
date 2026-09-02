"""Public specialist aliases for HTTP/API resume compatibility.

The production graph is `agents.workflow.build_persona_workflow`.
This module no longer compiles a four-specialist graph, and workers
must not go directly to END.
"""

from typing import Literal

# HTTP / resume 契约仍使用旧四值；图内 Worker 在 service 层映射到这里。
Specialist = Literal["conversation", "web", "memory", "management"]
