"""
架构验证测试 - 验证改进后的多 Agent 系统
"""
import json

def test_worker_registry():
    """测试 Worker 注册机制"""
    print("=" * 60)
    print("测试 1: Worker 注册机制")
    print("=" * 60)
    
    from agents.worker_registry import list_workers, get_worker_spec
    
    workers = list_workers()
    print(f"✓ 已注册 {len(workers)} 个 Worker")
    
    for worker in workers:
        print(f"\n【{worker.name}】")
        print(f"  工具数: {len(worker.tools)}")
        print(f"  工具列表: {', '.join(worker.tools[:3])}{'...' if len(worker.tools) > 3 else ''}")
        print(f"  需审批: {'是' if worker.requires_approval else '否'}")
    
    # 验证工具分配均衡性
    tool_counts = [len(w.tools) for w in workers]
    print(f"\n✓ 工具分配范围: {min(tool_counts)} - {max(tool_counts)}")
    print(f"✓ 平均每个 Worker: {sum(tool_counts) / len(tool_counts):.1f} 个工具")
    
    return True

def test_security_module():
    """测试安全模块"""
    print("\n" + "=" * 60)
    print("测试 2: 安全模块")
    print("=" * 60)
    
    from agents.security import InputValidator, RateLimiter
    
    # 测试路径验证
    try:
        InputValidator.validate_file_path("../../etc/passwd")
        print("✗ 路径遍历验证失败")
        return False
    except ValueError as e:
        print(f"✓ 路径遍历检测: {e}")
    
    # 测试 SQL 注入防护
    try:
        InputValidator.validate_sql_query("SELECT * FROM users; DROP TABLE users;")
        print("✗ SQL 注入验证失败")
        return False
    except ValueError as e:
        print(f"✓ SQL 注入检测: {e}")
    
    # 测试内容长度限制
    try:
        InputValidator.validate_content_length("x" * 20000, max_length=10000)
        print("✗ 内容长度验证失败")
        return False
    except ValueError as e:
        print(f"✓ 内容长度限制: {e}")
    
    # 测试速率限制
    limiter = RateLimiter()
    key = "test:operation"
    
    for i in range(5):
        allowed = limiter.check_limit(key, limit=3, window_seconds=60)
        if i < 3:
            if not allowed:
                print(f"✗ 速率限制错误: 第 {i+1} 次应该允许")
                return False
        else:
            if allowed:
                print(f"✗ 速率限制错误: 第 {i+1} 次应该拒绝")
                return False
    
    print("✓ 速率限制: 3/60s 正常工作")
    
    return True

def test_monitoring_module():
    """测试监控模块"""
    print("\n" + "=" * 60)
    print("测试 3: 监控模块")
    print("=" * 60)
    
    from agents.monitoring import global_monitor
    
    # 模拟工具调用
    global_monitor.record_call("knowledge", 123.45, True)
    global_monitor.record_call("knowledge", 234.56, True)
    global_monitor.record_call("knowledge", 345.67, False, "TimeoutError")
    
    # 获取指标
    metrics = global_monitor.get_metrics("knowledge")
    print(f"✓ 总调用: {metrics.get('total_calls')}")
    print(f"✓ 成功率: {metrics.get('success_rate')}")
    print(f"✓ 平均耗时: {metrics.get('avg_duration_ms')}")
    
    # 测试追踪
    global_monitor.start_trace("test-req-123", "persona-456", "conv-789")
    import time
    start = time.time()
    time.sleep(0.01)
    end = time.time()
    global_monitor.add_worker_to_trace("test-req-123", "knowledge", start, end)
    trace = global_monitor.end_trace("test-req-123")
    
    if trace:
        print(f"✓ 请求追踪: {trace['request_id']}, 耗时 {trace['total_duration_ms']:.2f}ms")
    
    # 健康检查
    health = global_monitor.get_health_status()
    print(f"✓ 健康状态: {health['status']}")
    
    return True

def test_tool_allocation():
    """测试工具分配"""
    print("\n" + "=" * 60)
    print("测试 4: 工具分配和权限")
    print("=" * 60)
    
    from agents.registry import list_tool_specs
    
    specs = list_tool_specs()
    print(f"✓ 总工具数: {len(specs)}")
    
    # 按 Worker 分组统计
    by_worker = {}
    needs_approval = 0
    
    for spec in specs:
        worker = spec.worker
        if worker not in by_worker:
            by_worker[worker] = []
        by_worker[worker].append(spec.name)
        if spec.requires_confirmation:
            needs_approval += 1
    
    print(f"\n工具分配统计:")
    for worker, tools in sorted(by_worker.items()):
        print(f"  {worker}: {len(tools)} 个工具")
    
    print(f"\n✓ 需审批工具: {needs_approval}/{len(specs)} ({needs_approval/len(specs)*100:.1f}%)")
    
    return True

def test_graph_structure():
    """测试图结构"""
    print("\n" + "=" * 60)
    print("测试 5: LangGraph 图结构")
    print("=" * 60)
    
    from agents.workflow import _build_persona_sub_workflow
    from agents.registry import list_tool_specs
    from unittest.mock import MagicMock
    
    # 创建模拟对象
    mock_persona = MagicMock()
    mock_persona.id = "test-persona"
    mock_persona.name = "测试人设"
    
    try:
        # 构建图（只测试结构，不执行）
        graph = _build_persona_sub_workflow(mock_persona)
        
        # 检查节点
        nodes = graph.nodes
        print(f"✓ 图节点数: {len(nodes)}")
        
        # 预期节点
        expected_nodes = ["supervisor", "knowledge", "memory", "document", "profile", "voice_clone", "config"]
        
        for node in expected_nodes:
            if node in nodes:
                print(f"  ✓ {node}")
            else:
                print(f"  ✗ {node} 缺失")
                return False
        
        print("\n✓ 所有 Worker 节点已注册")
        return True
        
    except Exception as e:
        print(f"✗ 图构建失败: {e}")
        return False

def main():
    """运行所有测试"""
    print("\n🔍 YUMENO 多 Agent 架构验证测试\n")
    
    tests = [
        ("Worker 注册机制", test_worker_registry),
        ("安全模块", test_security_module),
        ("监控模块", test_monitoring_module),
        ("工具分配", test_tool_allocation),
        ("图结构", test_graph_structure)
    ]
    
    results = []
    
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ {name} 测试异常: {e}")
            import traceback
            traceback.print_exc()
            results.append((name, False))
    
    # 总结
    print("\n" + "=" * 60)
    print("测试结果总结")
    print("=" * 60)
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = "✓ 通过" if result else "✗ 失败"
        print(f"{status}: {name}")
    
    print(f"\n总计: {passed}/{total} 通过 ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("\n🎉 所有测试通过！架构健壮性验证成功。")
    else:
        print(f"\n⚠️  有 {total - passed} 个测试失败，需要修复。")
    
    return passed == total

if __name__ == "__main__":
    import sys
    sys.path.insert(0, ".")
    success = main()
    sys.exit(0 if success else 1)
