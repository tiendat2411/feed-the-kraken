import React, { useState, useEffect, useMemo } from 'react';
import quickJourneyConfig from '../config/maps/quick-journey.json';
import longJourneyConfig from '../config/maps/long-journey.json';

/**
 * MapBoardUI Component (BR-004)
 * Trực quan hóa bản đồ lục giác SVG, hoạt ảnh con tàu,
 * hành động ô bản đồ (Map Actions), hiệu ứng thẻ bài (Card Effects)
 * và Nghi thức Tà giáo (Cult Uprising).
 */
const MapBoardUI = ({
  room,
  currentUserId,
  myRole,
  onExecuteMapAction,
  onConfirmMapAction,
  onDesignateCardTarget,
  onResolveTelescope,
  onAcknowledgeMermaid,
  onStartCultUprising,
  onResolveCultGuns,
  onResolveCultCabinSearch,
  onResolveCultConversion
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [gunsAllocation, setGunsAllocation] = useState({});
  const [privateNotification, setPrivateNotification] = useState(null);

  const players = room?.players || [];
  const me = players.find(p => p.id === currentUserId || p.sessionToken === currentUserId);
  const isCaptain = me?.id === room?.captainId;
  const isCultLeader = myRole === 'CULT_LEADER' || me?.factionRole === 'CULT_LEADER';

  const mapConfig = room?.mapType === 'LONG_JOURNEY' ? longJourneyConfig : quickJourneyConfig;
  const shipPositionId = room?.mapBoard?.shipPosition || 'START';
  const visitedNodes = room?.mapBoard?.visitedNodes || ['START'];
  const gamePhase = room?.gamePhase || 'EXECUTE_ACTIONS';

  // Khởi tạo phân bổ súng mặc định khi vào phase Guns Stash
  useEffect(() => {
    if (room?.pendingCultRitual?.type === 'GUNS_STASH' && isCultLeader) {
      const initial = {};
      players.forEach(p => {
        if (p.status !== 'ELIMINATED') initial[p.id] = 0;
      });
      if (me) initial[me.id] = 3;
      setGunsAllocation(initial);
    }
  }, [room?.pendingCultRitual?.type, isCultLeader]);

  // Pointy-topped hexagon path generator (R = 40)
  const getHexPolygonPoints = (cx, cy, r = 42) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      // Pointy-topped: angle starts at 30 deg (Math.PI / 6)
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  // Convert map coordinates (percentages) to SVG space (1000x850)
  const getNodeSvgCoord = (node) => {
    const svgX = (node.x / 100) * 920 + 40;
    const svgY = (node.y / 100) * 740 + 60;
    return { x: svgX, y: svgY };
  };

  // Node Map lookup
  const nodeMap = useMemo(() => {
    const map = new Map();
    mapConfig.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [mapConfig]);

  const currentNode = nodeMap.get(shipPositionId) || nodeMap.get('START');

  // Total allocated guns check
  const totalAllocatedGuns = Object.values(gunsAllocation).reduce((sum, val) => sum + (Number(val) || 0), 0);

  // Eligible targets for Captain Map Action & Card Target
  const eligibleCrew = players.filter(p => p.id !== me?.id && p.status !== 'ELIMINATED');

  // Eligible targets for Cult Conversion (isConvertible == true, status == ACTIVE, not Cult Leader)
  const convertibleCrew = players.filter(p => p.id !== me?.id && p.status === 'ACTIVE' && p.isConvertible !== false);

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'CABIN_SEARCH': return '🔍';
      case 'FLOGGING': return '🩸';
      case 'OFF_WITH_THE_TONGUE': return '🔒';
      case 'FEED_THE_KRAKEN': return '🐙';
      default: return '⚓';
    }
  };

  const getActionName = (actionType) => {
    switch (actionType) {
      case 'CABIN_SEARCH': return 'Khám Xét Cabin';
      case 'FLOGGING': return 'Đánh Roi / Tra Khảo';
      case 'OFF_WITH_THE_TONGUE': return 'Cắt Lưỡi';
      case 'FEED_THE_KRAKEN': return 'Tế Thần Kraken';
      default: return 'Vùng Biển Êm Đềm';
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] bg-slate-950 text-white flex flex-col items-center justify-between p-4 overflow-hidden select-none">
      {/* Background Ocean & Compass Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top HUD Bar */}
      <div className="relative z-10 w-full max-w-6xl flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-2xl">
        <div className="flex items-center space-x-3">
          <span className="text-3xl animate-bounce">⛵</span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Vị Trí Hiện Tại</div>
            <div className="text-lg font-black text-amber-400 flex items-center gap-2">
              {currentNode?.name}
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Node: {currentNode?.id}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-blue-400">🗺️</span>
            <span className="text-slate-300 font-medium">{mapConfig.name}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-purple-400">🔮</span>
            <span className="text-slate-300 font-medium">
              Nghi thức: {room?.mapBoard?.cultRitualDeck?.length ?? 5} lá
            </span>
          </div>

          {room?.mapType === 'LONG_JOURNEY' && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${room?.mapBoard?.hasCrossedSupplyLine ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}>
              <span>📦</span>
              <span className="font-medium">
                Tuyến tiếp tế: {room?.mapBoard?.hasCrossedSupplyLine ? 'Đã kích hoạt' : 'Chưa cắt qua'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main SVG Hexagonal Map Container */}
      <div className="relative z-10 w-full max-w-6xl flex-1 flex items-center justify-center my-2">
        <div className="w-full h-full max-h-[640px] aspect-[10/8] relative rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900/50 backdrop-blur-sm shadow-2xl p-2">
          <svg viewBox="0 0 1000 850" className="w-full h-full">
            <defs>
              {/* Gradients */}
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#020617" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
              <linearGradient id="pirateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#450a0a" />
              </linearGradient>
              <linearGradient id="sailorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0c4a6e" />
              </linearGradient>
              <linearGradient id="cultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7e22ce" />
                <stop offset="100%" stopColor="#3b0764" />
              </linearGradient>

              {/* Marker Arrows */}
              <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" opacity="0.8" />
              </marker>
              <marker id="arrow-yellow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#eab308" opacity="0.8" />
              </marker>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" opacity="0.8" />
              </marker>

              {/* Glow Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ocean Surface */}
            <rect width="1000" height="850" fill="url(#oceanGrad)" rx="24" />

            {/* Draw Supply Line Boundary if Long Journey */}
            {room?.mapType === 'LONG_JOURNEY' && (
              <g className="opacity-80">
                <line x1="80" y1="460" x2="920" y2="460" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="8 8" />
                <text x="500" y="450" fill="#f59e0b" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="3">
                  ⚔️ RANH GIỚI TUYẾN TIẾP TẾ (SUPPLY LINE) ⚔️
                </text>
              </g>
            )}

            {/* 1. Draw Path Connections (Edges with Colors) */}
            {mapConfig.nodes.map(node => {
              const fromCoord = getNodeSvgCoord(node);
              const transitions = node.transitions || {};

              return Object.entries(transitions).map(([color, targetId]) => {
                const targetNode = nodeMap.get(targetId);
                if (!targetNode) return null;

                const toCoord = getNodeSvgCoord(targetNode);
                let strokeColor = '#64748b';
                let markerId = '';

                if (color === 'RED') {
                  strokeColor = '#ef4444';
                  markerId = 'url(#arrow-red)';
                } else if (color === 'YELLOW') {
                  strokeColor = '#eab308';
                  markerId = 'url(#arrow-yellow)';
                } else if (color === 'BLUE') {
                  strokeColor = '#38bdf8';
                  markerId = 'url(#arrow-blue)';
                }

                // Kiểm tra xem đoạn đường này có nằm trong lịch sử di chuyển không
                const isTraversed = visitedNodes.includes(node.id) && visitedNodes.includes(targetId);

                return (
                  <line
                    key={`${node.id}-${color}-${targetId}`}
                    x1={fromCoord.x}
                    y1={fromCoord.y}
                    x2={toCoord.x}
                    y2={toCoord.y}
                    stroke={strokeColor}
                    strokeWidth={isTraversed ? 3.5 : 1.8}
                    strokeOpacity={isTraversed ? 0.9 : 0.35}
                    strokeDasharray={isTraversed ? 'none' : '4 4'}
                    markerEnd={markerId}
                  />
                );
              });
            })}

            {/* 2. Draw Hexagon Nodes */}
            {mapConfig.nodes.map(node => {
              const coord = getNodeSvgCoord(node);
              const isCurrent = node.id === shipPositionId;
              const isVisited = visitedNodes.includes(node.id);
              const isVictory = Boolean(node.victoryZone);

              let fillColor = '#1e293b';
              let strokeColor = '#475569';
              let strokeWidth = 1.5;

              if (node.victoryZone === 'PIRATE_VICTORY') {
                fillColor = 'url(#pirateGrad)';
                strokeColor = '#f87171';
                strokeWidth = 3;
              } else if (node.victoryZone === 'SAILOR_VICTORY') {
                fillColor = 'url(#sailorGrad)';
                strokeColor = '#38bdf8';
                strokeWidth = 3;
              } else if (node.victoryZone === 'CULT_VICTORY') {
                fillColor = 'url(#cultGrad)';
                strokeColor = '#c084fc';
                strokeWidth = 3;
              } else if (isVisited) {
                fillColor = '#334155';
                strokeColor = '#fbbf24';
                strokeWidth = 2.5;
              }

              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-transform duration-300 hover:scale-105"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Hexagon Shape */}
                  <polygon
                    points={getHexPolygonPoints(coord.x, coord.y, isVictory ? 50 : 38)}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    filter={isCurrent ? 'url(#glow)' : 'none'}
                  />

                  {/* Node Icon / Action Symbol */}
                  <text
                    x={coord.x}
                    y={coord.y - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isVictory ? '24' : '18'}
                    className="select-none pointer-events-none"
                  >
                    {node.victoryZone === 'PIRATE_VICTORY' ? '🏴‍☠️' :
                     node.victoryZone === 'SAILOR_VICTORY' ? '⚓' :
                     node.victoryZone === 'CULT_VICTORY' ? '🦑' :
                     node.id === 'START' ? '🦀' :
                     getActionIcon(node.mapAction)}
                  </text>

                  {/* Node Short Label */}
                  <text
                    x={coord.x}
                    y={coord.y + 18}
                    textAnchor="middle"
                    fontSize={isVictory ? '11' : '9'}
                    fontWeight="bold"
                    fill={isVictory ? '#fef08a' : '#cbd5e1'}
                    className="select-none pointer-events-none uppercase tracking-wider"
                  >
                    {node.id}
                  </text>

                  {/* Animated Ship Marker on Current Node */}
                  {isCurrent && (
                    <g className="animate-bounce" filter="url(#glow)">
                      <circle cx={coord.x} cy={coord.y - 36} r="18" fill="#fbbf24" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2" />
                      <text x={coord.x} y={coord.y - 34} textAnchor="middle" dominantBaseline="middle" fontSize="20">
                        ⛵
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Node Info Tooltip */}
          {hoveredNode && (
            <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-900/90 border border-slate-700 backdrop-blur-md shadow-2xl text-xs max-w-xs pointer-events-none animate-fadeIn">
              <div className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                <span>{getActionIcon(hoveredNode.mapAction)}</span>
                {hoveredNode.name}
              </div>
              <div className="text-slate-300 mt-1">
                Hành động: <span className="font-semibold text-white">{getActionName(hoveredNode.mapAction)}</span>
              </div>
              {hoveredNode.victoryZone && (
                <div className="text-emerald-400 font-bold mt-1">
                  🏆 Vùng Thắng Cuộc: {hoveredNode.victoryZone}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EXECUTE MAP ACTION (UC-013) */}
      {/* ========================================================================= */}
      {gamePhase === 'EXECUTE_MAP_ACTION' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col space-y-5">
            <div className="text-center space-y-1">
              <div className="text-4xl">{getActionIcon(room?.pendingMapAction?.type)}</div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
                HÀNH ĐỘNG Ô BẢN ĐỒ: {getActionName(room?.pendingMapAction?.type)}
              </h2>
              <p className="text-xs text-slate-400">Vị trí: {currentNode?.name}</p>
            </div>

            {/* Captain's Target Selection Interface */}
            {isCaptain ? (
              <div className="space-y-4">
                <p className="text-sm text-amber-200/90 text-center">
                  Thưa Thuyền trưởng, hãy chọn 1 thủy thủ đoàn để thực hiện hành động này:
                </p>

                <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {eligibleCrew.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedTargetId(p.id)}
                      className={`p-3 rounded-2xl border flex items-center space-x-3 transition-all text-left ${selectedTargetId === p.id ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20 text-white' : 'bg-slate-800/70 border-slate-700 hover:border-slate-600 text-slate-300'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-xl font-bold">
                        {p.nickname.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate text-sm">{p.nickname}</div>
                        <div className="text-xs text-slate-400">Súng: {p.gunCount} | {p.status}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {room?.lastMapActionResult ? (
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-emerald-500/40 space-y-3 text-center">
                    <div className="text-emerald-300 font-bold text-sm">
                      {room.lastMapActionResult.publicMessage}
                    </div>
                    <button
                      onClick={onConfirmMapAction}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-black text-white shadow-lg transition"
                    >
                      XÁC NHẬN & TIẾP TỤC HẢI TRÌNH ➔
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={!selectedTargetId}
                    onClick={() => onExecuteMapAction(selectedTargetId)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 font-black text-slate-950 shadow-lg transition"
                  >
                    THỰC THI HÀNH ĐỘNG NGAY
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  Thuyền trưởng đang cân nhắc thực thi hành động <span className="text-amber-400">{getActionName(room?.pendingMapAction?.type)}</span>...
                </p>
                {room?.lastMapActionResult && (
                  <div className="text-emerald-300 font-bold text-sm animate-pulse">
                    {room.lastMapActionResult.publicMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CARD ACTION TARGET SELECTION (Mermaid / Telescope - UC-014 AC-2) */}
      {/* ========================================================================= */}
      {gamePhase === 'CARD_ACTION_TARGET_SELECTION' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="text-4xl">{room?.pendingCardAction?.type === 'MERMAID' ? '🧜‍♀️' : '🔭'}</div>
              <h2 className="text-2xl font-black text-cyan-300">
                {room?.pendingCardAction?.type === 'MERMAID' ? 'TIẾNG HÁT TIÊN CÁ (MERMAID)' : 'KÍNH VIỄN VỌNG (TELESCOPE)'}
              </h2>
              <p className="text-xs text-slate-400">
                {room?.pendingCardAction?.type === 'MERMAID'
                  ? 'Thuyền trưởng hãy chỉ định 1 người bí mật xem 3 lá bài trong Hòm Bỏ.'
                  : 'Thuyền trưởng hãy chỉ định 1 người bí mật xem lá bài trên đỉnh Chồng Rút.'}
              </p>
            </div>

            {isCaptain ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {eligibleCrew.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedTargetId(p.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center space-x-2 transition ${selectedTargetId === p.id ? 'bg-cyan-500/20 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}
                    >
                      <span className="font-bold text-sm truncate">{p.nickname}</span>
                    </button>
                  ))}
                </div>
                <button
                  disabled={!selectedTargetId}
                  onClick={() => onDesignateCardTarget(selectedTargetId)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-black text-white disabled:opacity-50 transition"
                >
                  CHỈ ĐỊNH NGƯỜI NÀY
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-300">
                Thuyền trưởng đang chọn người được hưởng quyền năng...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MERMAID INSPECTION POPUP (AC-2 UC-014) */}
      {/* ========================================================================= */}
      {room?.myMermaidCards && room.myMermaidCards.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center space-y-4">
            <div className="text-4xl animate-pulse">🧜‍♀️</div>
            <h3 className="text-xl font-black text-cyan-300">TIẾNG HÁT TIÊN CÁ</h3>
            <p className="text-xs text-slate-400">
              Bạn đang nhìn trộm 3 lá bài ngẫu nhiên từ Hòm Bài Bị Hủy (Discard Pile):
            </p>
            <div className="flex justify-center gap-3">
              {room.myMermaidCards.map((c, idx) => (
                <div key={idx} className={`w-24 h-36 rounded-2xl border p-2 flex flex-col items-center justify-center font-bold text-xs shadow-lg ${c.color === 'BLUE' ? 'bg-cyan-950 border-cyan-500 text-cyan-200' : c.color === 'RED' ? 'bg-rose-950 border-rose-500 text-rose-200' : 'bg-amber-950 border-amber-500 text-amber-200'}`}>
                  <span className="text-2xl">{c.color === 'BLUE' ? '⚓' : c.color === 'RED' ? '⚔️' : '🐙'}</span>
                  <span>{c.color}</span>
                </div>
              ))}
            </div>
            <button
              onClick={onAcknowledgeMermaid}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black transition"
            >
              ĐÃ LẮNG NGHE XONG (ĐÓNG LẠI)
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TELESCOPE INSPECTION POPUP (AC-3 UC-014) */}
      {/* ========================================================================= */}
      {room?.myTelescopeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center space-y-4">
            <div className="text-4xl animate-bounce">🔭</div>
            <h3 className="text-xl font-black text-cyan-300">KÍNH VIỄN VỌNG</h3>
            <p className="text-xs text-slate-400">Bạn đang soi lá bài trên đỉnh Chồng Bài Rút (Draw Pile):</p>
            <div className="flex justify-center">
              <div className={`w-28 h-40 rounded-2xl border p-3 flex flex-col items-center justify-center font-bold text-sm shadow-2xl ${room.myTelescopeCard.color === 'BLUE' ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : room.myTelescopeCard.color === 'RED' ? 'bg-rose-950 border-rose-400 text-rose-200' : 'bg-amber-950 border-amber-400 text-amber-200'}`}>
                <span className="text-3xl">{room.myTelescopeCard.color === 'BLUE' ? '⚓' : room.myTelescopeCard.color === 'RED' ? '⚔️' : '🐙'}</span>
                <span className="mt-1">{room.myTelescopeCard.color}</span>
                <span className="text-[10px] text-slate-400 mt-1">{room.myTelescopeCard.action}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => onResolveTelescope('KEEP')}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg"
              >
                GIỮ TRÊN ĐỈNH (KEEP)
              </button>
              <button
                onClick={() => onResolveTelescope('DISCARD')}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow-lg"
              >
                VỨT VÀO HÒM BỎ (DISCARD)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CULT UPRISING INITIATION BUTTON (UC-015) */}
      {/* ========================================================================= */}
      {gamePhase === 'CULT_UPRISING' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-purple-500/50 text-center space-y-4 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <div className="text-5xl animate-pulse">🐙</div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              NGHI THỨC TÀ GIÁO (CULT UPRISING)
            </h2>
            <p className="text-xs text-slate-400">
              Lá bài Điều hướng vừa kích hoạt lời nguyền cổ xưa!
            </p>
            {isCaptain ? (
              <button
                onClick={onStartCultUprising}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-black text-white shadow-xl transition"
              >
                LẬT MỞ BÀI NGHI THỨC ➔
              </button>
            ) : (
              <div className="text-slate-300 text-sm">
                Đang chờ Thuyền trưởng lật mở bài Nghi thức...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: CULT UPRISING BLIND OVERLAY (Anti-Sniffing AC-1, AC-2, AC-3) */}
      {/* ========================================================================= */}
      {gamePhase === 'CULT_UPRISING_BLIND' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black select-none animate-fadeIn">
          {/* MÀN ĐÊM DÀNH CHO NGƯỜI CHƠI THƯỜNG (AC-1 Anti-Sniffing) */}
          {!isCultLeader ? (
            <div className="text-center space-y-6 max-w-lg p-8">
              <div className="text-6xl animate-pulse">🌙</div>
              <h2 className="text-3xl font-black tracking-widest text-slate-400">
                MÀN ĐÊM BUÔNG XUỐNG...
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tất cả thủy thủ đoàn đang nhắm mắt trong sợ hãi.
                Nghi thức Tà giáo huyền bí đang diễn ra trong bóng tối...
              </p>
            </div>
          ) : (
            /* BẢNG ĐIỀU KHIỂN DÀNH CHO GIÁO CHỦ (CULT LEADER) */
            <div className="w-full max-w-xl p-6 rounded-3xl bg-slate-900 border border-purple-500/70 shadow-[0_0_60px_rgba(168,85,247,0.4)] space-y-5 text-center">
              <div className="space-y-1">
                <div className="text-4xl">👑 🐙</div>
                <h2 className="text-2xl font-black text-purple-300">
                  GIÁO CHỦ - QUYỀN NĂNG TÀ GIÁO
                </h2>
                <p className="text-xs text-purple-200/80">
                  Loại nghi thức: <span className="font-bold uppercase text-amber-300">{room?.pendingCultRitual?.type}</span>
                </p>
              </div>

              {/* CASE 1: GUNS STASH (AC-2) */}
              {room?.pendingCultRitual?.type === 'GUNS_STASH' && (
                <div className="space-y-4 text-left">
                  <div className="text-xs text-slate-300">
                    Phân phát đúng <span className="font-bold text-amber-400">3 khẩu súng</span> cho bất kỳ ai (Đã chia: {totalAllocatedGuns}/3):
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                    {players.filter(p => p.status !== 'ELIMINATED').map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                        <span className="font-bold text-slate-200">{p.nickname} {p.id === me?.id && '(Bạn)'}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setGunsAllocation(prev => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] || 0) - 1) }))}
                            className="w-7 h-7 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-600"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-black text-amber-400">{gunsAllocation[p.id] || 0}</span>
                          <button
                            disabled={totalAllocatedGuns >= 3}
                            onClick={() => setGunsAllocation(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }))}
                            className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    disabled={totalAllocatedGuns !== 3}
                    onClick={() => {
                      const allocations = Object.entries(gunsAllocation)
                        .filter(([_, count]) => count > 0)
                        .map(([playerId, count]) => ({ playerId, count }));
                      onResolveCultGuns(allocations);
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-black text-white disabled:opacity-50 transition"
                  >
                    XÁC NHẬN CẤP 3 KHẨU SÚNG ➔
                  </button>
                </div>
              )}

              {/* CASE 2: CULT CABIN SEARCH */}
              {room?.pendingCultRitual?.type === 'CULT_CABIN_SEARCH' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-left space-y-2 text-xs">
                    <div className="font-bold text-amber-300 mb-2">Thị Kiến Thật Ban Điều Hướng:</div>
                    <div>Thuyền trưởng: <span className="font-bold text-white">{room?.myCultInspection?.captain?.name}</span> ({room?.myCultInspection?.captain?.role})</div>
                    <div>Thuyền phó: <span className="font-bold text-white">{room?.myCultInspection?.lieutenant?.name}</span> ({room?.myCultInspection?.lieutenant?.role})</div>
                    <div>Hoa tiêu: <span className="font-bold text-white">{room?.myCultInspection?.navigator?.name}</span> ({room?.myCultInspection?.navigator?.role})</div>
                  </div>
                  <button
                    onClick={onResolveCultCabinSearch}
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 font-black text-white transition"
                  >
                    HOÀN TẤT THỊ KIẾN (KẾT THÚC ĐÊM)
                  </button>
                </div>
              )}

              {/* CASE 3: CONVERSION (AC-3) */}
              {room?.pendingCultRitual?.type === 'CONVERSION' && (
                <div className="space-y-4 text-left">
                  <div className="text-xs text-slate-300">
                    Hãy chọn 1 người chưa bị miễn nhiễm để thu nạp vào Hội Tà Giáo:
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {convertibleCrew.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedTargetId(p.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center space-x-2 transition ${selectedTargetId === p.id ? 'bg-purple-600/30 border-purple-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}
                      >
                        <span className="font-bold text-xs truncate">{p.nickname}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={!selectedTargetId}
                    onClick={() => onResolveCultConversion(selectedTargetId)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-black text-white disabled:opacity-50 transition"
                  >
                    THU NẠP LÀM CULTIST ➔
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapBoardUI;
