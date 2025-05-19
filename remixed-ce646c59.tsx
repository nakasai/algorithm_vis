import { useState, useEffect } from 'react';
import { RotateCcw, Search, Plus, Trash, ChevronLeft, ChevronRight, Edit } from 'lucide-react';

// 各種コンポーネントの分離
const NodeControls = ({ 
  newNodeValue, setNewNodeValue, 
  searchValue, setSearchValue, 
  structureType, selectedNodeId, 
  arrayIndex, setArrayIndex, 
  nodes, editingNode, 
  searchStep, animating,
  handleInsert, handleInsertAtHead, handleInsertAtTail, 
  handleSearch, handleDelete, startEditingNode, resetList,
  toggleLayout, wrapList
}) => (
  <div>
    <h3 className="font-bold mb-2">操作パネル</h3>
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={newNodeValue}
          onChange={(e) => setNewNodeValue(e.target.value)}
          placeholder={structureType === 'array' ? '要素の値' : 'ノードの値'}
          className="border px-2 py-1 rounded"
          disabled={searchStep >= 0 || animating || editingNode}
        />
        
        {structureType === 'array' && (
          <input
            type="number"
            value={arrayIndex}
            onChange={(e) => setArrayIndex(e.target.value)}
            placeholder="インデックス"
            className="border px-2 py-1 rounded w-24"
            min="0"
            max={nodes.length}
            disabled={searchStep >= 0 || animating || editingNode}
          />
        )}
        
        {structureType !== 'array' ? (
          <>
            <button
              onClick={handleInsertAtHead}
              className="bg-green-500 text-white px-3 py-1 rounded flex items-center"
              disabled={searchStep >= 0 || animating || editingNode}
              title="リストの先頭に挿入"
            >
              <Plus size={16} className="mr-1" /> 先頭に挿入
            </button>
            
            <button
              onClick={handleInsert}
              className={`${selectedNodeId ? 'bg-green-500' : 'bg-gray-400'} text-white px-3 py-1 rounded flex items-center`}
              disabled={!selectedNodeId || searchStep >= 0 || animating || editingNode}
              title="選択ノードの後に挿入"
            >
              <Plus size={16} className="mr-1" /> 選択後に挿入
            </button>
            
            {(structureType === 'doubly' || structureType === 'circular') && (
              <button
                onClick={handleInsertAtTail}
                className="bg-green-500 text-white px-3 py-1 rounded flex items-center"
                disabled={searchStep >= 0 || animating || editingNode}
                title="リストの末尾に挿入"
              >
                <Plus size={16} className="mr-1" /> 末尾に挿入
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleInsert}
            className="bg-green-500 text-white px-3 py-1 rounded flex items-center"
            disabled={searchStep >= 0 || animating || editingNode}
            title="指定インデックスに挿入"
          >
            <Plus size={16} className="mr-1" /> 挿入
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="検索する値"
          className="border px-2 py-1 rounded flex-grow"
          disabled={searchStep >= 0 || animating || editingNode}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-3 py-1 rounded flex items-center"
          disabled={searchStep >= 0 || animating || editingNode}
        >
          <Search size={16} className="mr-1" /> 検索
        </button>
        <button
          onClick={handleDelete}
          className={`${selectedNodeId ? 'bg-red-500' : 'bg-gray-400'} text-white px-3 py-1 rounded flex items-center`}
          disabled={!selectedNodeId || searchStep >= 0 || animating || editingNode}
          title="選択されたノードを削除"
        >
          <Trash size={16} className="mr-1" /> 削除
        </button>
        <button
          onClick={startEditingNode}
          className={`${selectedNodeId ? 'bg-amber-500' : 'bg-gray-400'} text-white px-3 py-1 rounded flex items-center`}
          disabled={!selectedNodeId || searchStep >= 0 || animating || editingNode}
          title="選択されたノードの値を編集"
        >
          <Edit size={16} className="mr-1" /> 編集
        </button>
        <button
          onClick={resetList}
          className="bg-gray-500 text-white px-3 py-1 rounded flex items-center"
          disabled={searchStep >= 0 || animating || editingNode}
        >
          <RotateCcw size={16} className="mr-1" /> リセット
        </button>
      </div>
      
      <div className="flex items-center space-x-2 mt-2">
        <button
          onClick={toggleLayout}
          className={`${wrapList ? 'bg-indigo-500' : 'bg-gray-400'} text-white px-3 py-1 rounded flex items-center`}
          disabled={searchStep >= 0 || animating || editingNode}
        >
          {wrapList ? <ChevronLeft size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
          {wrapList ? '折り返し表示' : '一行表示'}
        </button>
      </div>
    </div>
  </div>
);

// メッセージパネル
const MessagePanel = ({ animating, animationFrames, currentFrame, message, selectedNodeId, editingNode }) => (
  <div>
    <h3 className="font-bold mb-2">操作メッセージ</h3>
    <div className="p-2 border rounded bg-gray-50 min-h-10">
      {animating && animationFrames.length > 0 ? 
        animationFrames[Math.min(currentFrame, animationFrames.length - 1)].message : 
        message
      }
      {animating && animationFrames.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          アニメーション: {currentFrame + 1}/{animationFrames.length}
        </div>
      )}
      {selectedNodeId && !animating && !editingNode && (
        <div className="mt-2 text-sm">
          選択されたノードを編集、削除するか、この位置に新しいノードを挿入できます。
        </div>
      )}
      {editingNode && (
        <div className="mt-2 text-sm">
          値を編集中です。入力を完了したら、✓ボタンをクリックするか、Enterキーで確定します。
        </div>
      )}
    </div>
  </div>
);

// リスト説明コンポーネント
const InstructionsPanel = ({ structureType }) => (
  <div className="mb-4 p-2 bg-yellow-50 border border-yellow-300 rounded-md">
    <p className="text-sm text-yellow-800">
      <strong>操作方法:</strong> {structureType === 'array' ? '要素' : 'ノード'}をクリックして選択 → 
      操作ボタンで編集・挿入・削除。値から探す場合は検索ボタンを使用。
    </p>
  </div>
);

// 配列説明コンポーネント
const ArrayInfoPanel = () => (
  <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
    <p className="text-sm text-blue-800">
      <strong>配列の特徴:</strong> 要素の挿入・削除時には、それ以降の要素をシフトする必要があります（O(n)の操作）。
      実際のプログラミング言語では、JavaScript/TypeScriptの配列やPythonのリストなどが例です。
    </p>
  </div>
);

// データ構造情報パネル
const InfoPanel = ({ structureType }) => (
  <div className="mt-6 p-4 bg-white rounded-lg shadow">
    <h3 className="font-bold mb-2">データ構造の説明</h3>
    
    {structureType === 'array' ? (
      <div>
        <p className="mb-2">
          <strong>配列:</strong> 要素が連続したメモリ領域に格納される静的なデータ構造です。
          インデックスを使って直接アクセスでき、O(1)の時間複雑度でランダムアクセスが可能です。
        </p>
        <p className="text-sm">
          特徴:
          <ul className="list-disc pl-5 mt-1">
            <li>インデックスによる高速アクセス（O(1)）</li>
            <li>中間要素の挿入/削除にはO(n)の時間がかかる - <strong>要素のシフトが必要</strong></li>
            <li>連続したメモリ領域を使用するためキャッシュ効率が良い</li>
          </ul>
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 border rounded">
          <h4 className="font-bold">単方向連結リスト</h4>
          <p className="text-sm">
            各ノードは次のノードへの一方向のリンクのみを持ちます。先頭から末尾への一方向の走査のみ可能です。
          </p>
        </div>
        <div className="p-3 border rounded">
          <h4 className="font-bold">双方向連結リスト</h4>
          <p className="text-sm">
            各ノードは次と前のノードへの両方向のリンクを持ちます。これにより双方向の走査が可能になります。
          </p>
        </div>
        <div className="p-3 border rounded">
          <h4 className="font-bold">循環リスト</h4>
          <p className="text-sm">
            末尾ノードが先頭ノードを指すことで循環構造を形成します。連続的な走査が可能です。
          </p>
        </div>
      </div>
    )}
  </div>
);

// メインコンポーネント
const DataStructureVisualizer = () => {
  // 状態管理
  const [structureType, setStructureType] = useState('array');
  const [nodes, setNodes] = useState([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(0);
  const [newNodeValue, setNewNodeValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [message, setMessage] = useState('操作するにはボタンを使用してください。');
  const [editingNode, setEditingNode] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [lastOperation, setLastOperation] = useState(null);
  
  // 選択状態
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [searchingNodeId, setSearchingNodeId] = useState(null);
  const [searchStep, setSearchStep] = useState(-1);
  
  // アニメーション状態
  const [animating, setAnimating] = useState(false);
  const [animationFrames, setAnimationFrames] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // 表示設定
  const [wrapList, setWrapList] = useState(false);
  const [arrayIndex, setArrayIndex] = useState('0');

  // 初期化
  useEffect(() => {
    resetList();
  }, [structureType]);
  
  // アニメーション制御
  useEffect(() => {
    if (animating && animationFrames.length > 0) {
      if (currentFrame < animationFrames.length) {
        const timer = setTimeout(() => {
          setCurrentFrame(currentFrame + 1);
        }, 700);
        return () => clearTimeout(timer);
      } else {
        setAnimating(false);
      }
    }
  }, [animating, animationFrames, currentFrame]);
  
  // 検索アニメーション
  useEffect(() => {
    if (searchStep >= 0 && searchStep < nodes.length) {
      const currentNode = nodes[searchStep];
      setSearchingNodeId(currentNode.id);
      setMessage(`ノード「${currentNode.value}」を検査中... ${searchStep + 1}/${nodes.length}`);
      
      if (currentNode.value === searchValue) {
        setTimeout(() => {
          setMessage(`値「${searchValue}」を持つノードが見つかりました！`);
          setSelectedNodeId(currentNode.id);
          setSearchStep(-1);
          setSearchingNodeId(null);
        }, 500);
      } else {
        setTimeout(() => {
          setSearchStep(searchStep + 1);
        }, 500);
      }
    } else if (searchStep >= nodes.length) {
      setSearchingNodeId(null);
      setSelectedNodeId(null);
      setMessage(`値「${searchValue}」を持つノードは見つかりませんでした。`);
      setSearchStep(-1);
    }
  }, [searchStep, nodes, searchValue]);
  
  // ID生成
  const generateId = () => {
    const newId = nodeIdCounter;
    setNodeIdCounter(prev => prev + 1);
    return newId;
  };
  
  // リセット
  const resetList = () => {
    const sampleNodes = [
      { id: 1, value: 'A' },
      { id: 2, value: 'B' },
      { id: 3, value: 'C' }
    ];
    
    setNodes(sampleNodes);
    setNodeIdCounter(4);
    setSelectedNodeId(null);
    setSearchingNodeId(null);
    setSearchStep(-1);
    setMessage(`${getStructureTypeName()}を操作するにはボタンを使用してください。`);
    setArrayIndex('0');
    setAnimating(false);
    setAnimationFrames([]);
    setCurrentFrame(0);
    setEditingNode(null);
    setEditValue('');
    setLastOperation(null);
  };
  
  // 構造タイプ名の取得
  const getStructureTypeName = () => {
    switch (structureType) {
      case 'singly': return '単方向連結リスト';
      case 'doubly': return '双方向連結リスト';
      case 'circular': return '循環リスト';
      case 'array': return '配列';
      default: return 'データ構造';
    }
  };
  
  // ノード選択
  const handleNodeClick = (nodeId) => {
    if (searchStep >= 0 || animating) return;
    if (editingNode && editingNode.id === nodeId) return;
    
    if (editingNode) {
      setEditingNode(null);
      setEditValue('');
    }
    
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
      setMessage('ノードの選択を解除しました。');
    } else {
      setSelectedNodeId(nodeId);
      const node = nodes.find(node => node.id === nodeId);
      setMessage(`ノード「${node.value}」を選択しました。`);
      
      if (structureType === 'array') {
        const index = nodes.findIndex(n => n.id === nodeId);
        if (index !== -1) {
          setArrayIndex(index.toString());
        }
      }
    }
  };
  
  // 挿入操作
  const handleInsert = () => {
    if (!newNodeValue.trim()) {
      setMessage('ノードの値を入力してください。');
      return;
    }
    
    if (animating || searchStep >= 0) {
      return;
    }
    
    const newNode = { id: generateId(), value: newNodeValue };
    
    if (structureType === 'array') {
      const index = parseInt(arrayIndex);
      if (isNaN(index) || index < 0 || index > nodes.length) {
        setMessage(`有効なインデックスを入力してください（0～${nodes.length}）`);
        return;
      }
      
      // アニメーション用フレーム生成
      const shiftingNodes = [...nodes];
      const insertedNodes = [...nodes];
      insertedNodes.splice(index, 0, newNode);
      
      // アニメーションフレーム設定
      const frames = [
        { nodes: [...nodes], message: `インデックス${index}に新しい要素「${newNode.value}」を挿入します。`, phase: 'start' },
        { nodes: shiftingNodes, message: `インデックス${index}以降の要素をシフトしています...`, phase: 'shifting' },
        { nodes: insertedNodes, message: `新しい要素「${newNode.value}」を挿入しました。`, phase: 'inserted' },
        { nodes: insertedNodes, message: `挿入完了: 要素「${newNode.value}」がインデックス${index}に追加されました。`, phase: 'complete' }
      ];
      
      setAnimationFrames(frames);
      setCurrentFrame(0);
      setAnimating(true);
      setLastOperation('insert');
      
      setTimeout(() => {
        setNodes(insertedNodes);
        setSelectedNodeId(newNode.id);
        setNewNodeValue('');
        setArrayIndex(Math.min(index + 1, insertedNodes.length).toString());
      }, frames.length * 700);
    } else {
      let updatedNodes = [];
      
      if (selectedNodeId) {
        const insertIndex = nodes.findIndex(node => node.id === selectedNodeId) + 1;
        updatedNodes = [...nodes.slice(0, insertIndex), newNode, ...nodes.slice(insertIndex)];
        const selectedNode = nodes.find(node => node.id === selectedNodeId);
        setMessage(`新しいノード「${newNodeValue}」を「${selectedNode.value}」の後に挿入しました。`);
        setLastOperation('insert_after');
      } else {
        updatedNodes = [newNode, ...nodes];
        setMessage(`新しいノード「${newNodeValue}」を${getStructureTypeName()}の先頭に挿入しました。`);
        setLastOperation('insert_head');
      }
      
      setNodes(updatedNodes);
      setSelectedNodeId(newNode.id);
      setNewNodeValue('');
    }
  };
  
  // 先頭への挿入
  const handleInsertAtHead = () => {
    if (!newNodeValue.trim()) {
      setMessage('ノードの値を入力してください。');
      return;
    }
    
    const newNode = { id: generateId(), value: newNodeValue };
    setNodes([newNode, ...nodes]);
    setSelectedNodeId(newNode.id);
    setNewNodeValue('');
    setMessage(`新しいノード「${newNodeValue}」を${getStructureTypeName()}の先頭に挿入しました。`);
    setLastOperation('insert_head');
  };
  
  // 末尾への挿入
  const handleInsertAtTail = () => {
    if (!newNodeValue.trim()) {
      setMessage('ノードの値を入力してください。');
      return;
    }
    
    const newNode = { id: generateId(), value: newNodeValue };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
    setNewNodeValue('');
    setMessage(`新しいノード「${newNodeValue}」を${getStructureTypeName()}の末尾に挿入しました。`);
    setLastOperation('insert_tail');
  };
  
  // 削除操作
  const handleDelete = () => {
    if (animating || searchStep >= 0) return;
    if (!selectedNodeId) {
      setMessage('削除するノードを選択してください。');
      return;
    }
    
    const nodeToDelete = nodes.find(node => node.id === selectedNodeId);
    if (!nodeToDelete) {
      setMessage('選択されたノードが見つかりません。');
      return;
    }
    
    if (structureType === 'array') {
      const index = nodes.findIndex(n => n.id === selectedNodeId);
      
      // 削除アニメーション
      const deleteFrames = [
        { nodes: [...nodes], message: `インデックス${index}の要素「${nodeToDelete.value}」を削除します。`, phase: 'start' },
        { nodes: [...nodes], message: `インデックス${index}の要素「${nodeToDelete.value}」を取り出しています...`, phase: 'removing' },
        { nodes: [...nodes], message: `インデックス${index}以降の要素をシフトしています...`, phase: 'shifting' }
      ];
      
      const finalNodes = [...nodes.slice(0, index), ...nodes.slice(index + 1)];
      deleteFrames.push({
        nodes: finalNodes,
        message: `削除完了: インデックス${index}から要素「${nodeToDelete.value}」が削除されました。`,
        phase: 'complete'
      });
      
      setAnimationFrames(deleteFrames);
      setCurrentFrame(0);
      setAnimating(true);
      setLastOperation('delete');
      
      setTimeout(() => {
        setNodes(finalNodes);
        setSelectedNodeId(null);
        const newIndex = Math.min(index, Math.max(0, finalNodes.length - 1));
        setArrayIndex(finalNodes.length > 0 ? newIndex.toString() : "0");
      }, deleteFrames.length * 700);
    } else {
      const updatedNodes = nodes.filter(node => node.id !== selectedNodeId);
      setNodes(updatedNodes);
      setSelectedNodeId(null);
      setMessage(`ノード「${nodeToDelete.value}」を削除しました。`);
      setLastOperation('delete');
    }
  };
  
  // 検索操作
  const handleSearch = () => {
    if (!searchValue.trim()) {
      setMessage('検索する値を入力してください。');
      return;
    }
    
    if (nodes.length === 0) {
      setMessage(`${getStructureTypeName()}が空です。検索できません。`);
      return;
    }
    
    setSelectedNodeId(null);
    setSearchingNodeId(null);
    setMessage(`値「${searchValue}」を持つノードを検索します。`);
    setSearchStep(0);
    setLastOperation('search');
  };
  
  // 編集モード開始
  const startEditingNode = () => {
    if (!selectedNodeId || animating || searchStep >= 0) return;
    
    const nodeToEdit = nodes.find(node => node.id === selectedNodeId);
    if (!nodeToEdit) return;
    
    setEditingNode(nodeToEdit);
    setEditValue(nodeToEdit.value);
    setMessage(`ノード「${nodeToEdit.value}」の値を編集します。`);
  };
  
  // 編集確定
  const confirmEdit = () => {
    if (!editingNode || !editValue.trim()) {
      setEditingNode(null);
      setEditValue('');
      return;
    }
    
    const oldValue = editingNode.value;
    if (oldValue === editValue) {
      setEditingNode(null);
      setEditValue('');
      setMessage('値が変更されていないため、編集をキャンセルしました。');
      return;
    }
    
    // 更新アニメーション
    const editFrames = [
      { nodes: [...nodes], message: `ノード「${oldValue}」の値を「${editValue}」に更新します。`, phase: 'start' },
      { nodes: [...nodes], message: `ノード「${oldValue}」の値を更新中...`, phase: 'updating' }
    ];
    
    const index = nodes.findIndex(node => node.id === editingNode.id);
    const updatedNodes = [...nodes];
    updatedNodes[index] = { ...nodes[index], value: editValue };
    
    editFrames.push({
      nodes: updatedNodes,
      message: `値の更新完了: 「${oldValue}」→「${editValue}」`,
      phase: 'complete'
    });
    
    setAnimationFrames(editFrames);
    setCurrentFrame(0);
    setAnimating(true);
    setLastOperation('edit');
    
    setTimeout(() => {
      setNodes(updatedNodes);
      setEditingNode(null);
      setEditValue('');
      setMessage(`ノードの値を「${oldValue}」から「${editValue}」に更新しました。`);
    }, editFrames.length * 700);
  };
  
  // 編集キャンセル
  const cancelEdit = () => {
    setEditingNode(null);
    setEditValue('');
    setMessage('編集をキャンセルしました。');
  };
  
  // レイアウト切替
  const toggleLayout = () => {
    setWrapList(!wrapList);
  };
  
  // 表示ノード取得
  const getCurrentNodesForDisplay = () => {
    if (!animating || animationFrames.length === 0) {
      return nodes;
    }
    
    const frame = animationFrames[Math.min(currentFrame, animationFrames.length - 1)];
    return frame?.nodes || nodes;
  };
  
  // 連結リスト描画
  const renderLinkedList = () => {
    const displayNodes = getCurrentNodesForDisplay();
    
    if (displayNodes.length === 0) {
      return <div className="text-center py-4">{getStructureTypeName()}は空です。</div>;
    }
    
    // 描画設定
    const nodesPerRow = wrapList ? 5 : displayNodes.length;
    const rows = wrapList ? Math.ceil(displayNodes.length / nodesPerRow) : 1;
    const nodeWidth = 100;
    const rowHeight = 180;
    const containerWidth = Math.min(900, nodesPerRow * nodeWidth + 160);
    const containerHeight = rows * rowHeight;
    
    // ノード位置
    const nodePositions = displayNodes.map((_, idx) => {
      const row = Math.floor(idx / nodesPerRow);
      const col = idx % nodesPerRow;
      const x = wrapList && row % 2 === 1 ? containerWidth - 120 - col * nodeWidth : 120 + col * nodeWidth;
      return { x, y: 70 + row * rowHeight };
    });
    
    return (
      <div className="w-full overflow-auto">
        <svg width={containerWidth} height={containerHeight} className="mx-auto">
          {/* 接続矢印 */}
          {displayNodes.length > 1 && displayNodes.map((_, idx) => {
            if (idx >= displayNodes.length - 1) return null;
            
            const fromPos = nodePositions[idx];
            const toPos = nodePositions[idx + 1];
            const isWrapping = wrapList && Math.floor(idx / nodesPerRow) !== Math.floor((idx + 1) / nodesPerRow);
            
            return (
              <g key={`arrow-${idx}`}>
                <defs>
                  <marker id={`arrowhead-${idx}`} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
                  </marker>
                </defs>
                
                {isWrapping ? (
                  // 折り返し矢印
                  <path
                    d={`M ${fromPos.x + 35} ${fromPos.y} 
                        C ${fromPos.x + 70} ${fromPos.y + 50}, 
                          ${toPos.x} ${fromPos.y + 50}, 
                          ${toPos.x} ${toPos.y - 40}`}
                    stroke="#333" strokeWidth="2" fill="none" markerEnd={`url(#arrowhead-${idx})`}
                  />
                ) : (
                  // 通常矢印
                  <path
                    d={`M ${fromPos.x + 35} ${fromPos.y} L ${toPos.x - 35} ${toPos.y}`}
                    stroke="#333" strokeWidth="2" fill="none" markerEnd={`url(#arrowhead-${idx})`}
                  />
                )}
                
                {/* 双方向リストの戻り矢印 */}
                {structureType === 'doubly' && (
                  <>
                    <defs>
                      <marker id={`arrowhead-back-${idx}`} markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="10 0, 0 3.5, 10 7" fill="#666" />
                      </marker>
                    </defs>
                    
                    {isWrapping ? (
                      <path
                        d={`M ${toPos.x - 10} ${toPos.y + 10} 
                            C ${toPos.x - 50} ${fromPos.y + 80}, 
                              ${fromPos.x + 50} ${fromPos.y + 80}, 
                              ${fromPos.x + 25} ${fromPos.y + 10}`}
                        stroke="#666" strokeWidth="2" strokeDasharray="5,2" fill="none" markerEnd={`url(#arrowhead-back-${idx})`}
                      />
                    ) : (
                      <path
                        d={`M ${toPos.x - 35} ${toPos.y + 15} L ${fromPos.x + 35} ${fromPos.y + 15}`}
                        stroke="#666" strokeWidth="2" strokeDasharray="5,2" fill="none" markerEnd={`url(#arrowhead-back-${idx})`}
                      />
                    )}
                  </>
                )}
              </g>
            );
          })}
          
          {/* 循環リスト末尾→先頭矢印 */}
          {structureType === 'circular' && displayNodes.length > 1 && (
            <g>
              <defs>
                <marker id="arrowhead-circular" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#0066cc" />
                </marker>
              </defs>
              
              {wrapList ? (
                <path
                  d={`M ${nodePositions[displayNodes.length-1].x + 35} ${nodePositions[displayNodes.length-1].y} 
                      C ${nodePositions[displayNodes.length-1].x + 70} ${nodePositions[displayNodes.length-1].y + 40}, 
                        ${nodePositions[0].x - 70} ${nodePositions[0].y + 40}, 
                        ${nodePositions[0].x - 35} ${nodePositions[0].y}`}
                  stroke="#0066cc" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-circular)"
                />
              ) : (
                <path
                  d={`M ${nodePositions[displayNodes.length-1].x + 35} ${nodePositions[displayNodes.length-1].y} 
                      C ${nodePositions[displayNodes.length-1].x + 100} ${nodePositions[displayNodes.length-1].y - 80}, 
                        ${nodePositions[0].x - 100} ${nodePositions[0].y - 80}, 
                        ${nodePositions[0].x - 35} ${nodePositions[0].y}`}
                  stroke="#0066cc" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-circular)"
                />
              )}
            </g>
          )}
          
          {/* NULL表示 */}
          {['singly', 'doubly'].includes(structureType) && displayNodes.length > 0 && (
            <g>
              <rect
                x={nodePositions[displayNodes.length-1].x + 60}
                y={nodePositions[displayNodes.length-1].y - 15}
                width="40" height="30" rx="5" fill="white" stroke="#999"
              />
              <text
                x={nodePositions[displayNodes.length-1].x + 80}
                y={nodePositions[displayNodes.length-1].y + 5}
                textAnchor="middle" fontSize="12" fill="#666"
              >
                NULL
              </text>
              <path
                d={`M ${nodePositions[displayNodes.length-1].x + 35} ${nodePositions[displayNodes.length-1].y} 
                    L ${nodePositions[displayNodes.length-1].x + 60} ${nodePositions[displayNodes.length-1].y}`}
                stroke="#333" strokeWidth="2" fill="none"
              />
            </g>
          )}
          
          {/* 双方向リストの先頭NULL */}
          {structureType === 'doubly' && displayNodes.length > 0 && (
            <g>
              <rect
                x={nodePositions[0].x - 80}
                y={nodePositions[0].y - 15}
                width="40" height="30" rx="5" fill="white" stroke="#999"
              />
              <text
                x={nodePositions[0].x - 60}
                y={nodePositions[0].y + 5}
                textAnchor="middle" fontSize="12" fill="#666"
              >
                NULL
              </text>
              <path
                d={`M ${nodePositions[0].x - 40} ${nodePositions[0].y} L ${nodePositions[0].x - 35} ${nodePositions[0].y}`}
                stroke="#333" strokeWidth="2" fill="none"
              />
            </g>
          )}
          
          {/* ノード描画 */}
          {displayNodes.map((node, idx) => {
            const isEditing = editingNode && editingNode.id === node.id;
            const isUpdating = animating && animationFrames.length > 0 && 
                               animationFrames[Math.min(currentFrame, animationFrames.length - 1)].phase === 'updating' &&
                               editingNode && editingNode.id === node.id;
            
            return (
              <g 
                key={node.id} 
                onClick={() => handleNodeClick(node.id)}
                style={{ cursor: isEditing ? 'default' : 'pointer' }}
              >
                <circle
                  cx={nodePositions[idx].x}
                  cy={nodePositions[idx].y}
                  r="35"
                  fill={isEditing ? '#fef3c7' : 
                        isUpdating ? '#dbeafe' :
                        node.id === selectedNodeId ? '#d1fae5' : 
                        node.id === searchingNodeId ? '#dbeafe' : 'white'}
                  stroke={isEditing ? '#f59e0b' :
                          isUpdating ? '#3b82f6' : 
                          node.id === selectedNodeId ? '#10b981' : 
                          node.id === searchingNodeId ? '#3b82f6' : '#d1d5db'}
                  strokeWidth={isUpdating ? "3" : "2"}
                />
                
                {isEditing ? (
                  <foreignObject
                    x={nodePositions[idx].x - 30}
                    y={nodePositions[idx].y - 15}
                    width="60" height="30"
                  >
                    <div className="h-full w-full flex items-center justify-center">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full h-full border rounded px-1 text-center"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </foreignObject>
                ) : (
                  <text
                    x={nodePositions[idx].x}
                    y={nodePositions[idx].y}
                    textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="bold"
                  >
                    {node.value}
                  </text>
                )}
                
                {/* 編集確定/キャンセルボタン */}
                {isEditing && (
                  <>
                    <circle cx={nodePositions[idx].x - 20} cy={nodePositions[idx].y + 25} r="12"
                      fill="#10b981"
                      onClick={(e) => { e.stopPropagation(); confirmEdit(); }}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x={nodePositions[idx].x - 20} y={nodePositions[idx].y + 25}
                      textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="white" fontWeight="bold"
                    >✓</text>
                    
                    <circle cx={nodePositions[idx].x + 20} cy={nodePositions[idx].y + 25} r="12"
                      fill="#ef4444"
                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x={nodePositions[idx].x + 20} y={nodePositions[idx].y + 25}
                      textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="white" fontWeight="bold"
                    >✕</text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };
  
  // 配列描画
  const renderArray = () => {
    const displayNodes = getCurrentNodesForDisplay();
    
    if (displayNodes.length === 0) {
      return <div className="text-center py-4">配列は空です。要素を追加してください。</div>;
    }
    
    // 配列描画設定
    const nodesPerRow = wrapList ? 8 : displayNodes.length;
    const rows = wrapList ? Math.ceil(displayNodes.length / nodesPerRow) : 1;
    const cellWidth = 70;
    const cellHeight = 70;
    const cellMargin = 10;
    const rowHeight = cellHeight + 60;
    const containerWidth = Math.min(900, nodesPerRow * (cellWidth + cellMargin * 2) + 50);
    const containerHeight = rows * rowHeight + 40;
    
    // 現在のアニメーションフレーム
    const currentAnimFrame = animating && animationFrames.length > 0 
      ? animationFrames[Math.min(currentFrame, animationFrames.length - 1)] 
      : null;
    
    // セル位置計算
    const getCellPosition = (idx) => {
      const row = Math.floor(idx / nodesPerRow);
      const col = idx % nodesPerRow;
      let x = 30 + col * (cellWidth + cellMargin * 2);
      let y = 40 + row * rowHeight;
      
      return { x, y };
    };
    
    return (
      <div className="w-full overflow-auto">
        <svg width={containerWidth} height={containerHeight} className="mx-auto">
          {/* アニメーションメッセージ */}
          {currentAnimFrame && (
            <text x={containerWidth / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#666">
              {currentAnimFrame.message}
            </text>
          )}
          
          {/* 配列要素描画 */}
          {displayNodes.map((node, idx) => {
            const position = getCellPosition(idx);
            const isEditing = editingNode && editingNode.id === node.id;
            const isUpdating = currentAnimFrame && 
                             currentAnimFrame.phase === 'updating' && 
                             editingNode && editingNode.id === node.id;
            
            // 削除中の要素はスキップ
            if (currentAnimFrame && currentAnimFrame.phase === 'removing' && 
                currentAnimFrame.deletePosition === idx) {
              return null;
            }
            
            return (
              <g key={node.id} onClick={() => handleNodeClick(node.id)}
                style={{ cursor: isEditing ? 'default' : 'pointer' }}>
                {/* インデックス表示 */}
                <text x={position.x + cellWidth / 2} y={position.y - 15}
                  textAnchor="middle" fontSize="14" fill="#666">{idx}</text>
                
                {/* セル */}
                <rect
                  x={position.x} y={position.y} 
                  width={cellWidth} height={cellHeight}
                  fill={isEditing ? '#fef3c7' : 
                        isUpdating ? '#dbeafe' :
                        node.id === selectedNodeId ? '#d1fae5' : 
                        node.id === searchingNodeId ? '#dbeafe' : 'white'}
                  stroke={isEditing ? '#f59e0b' :
                          isUpdating ? '#3b82f6' : 
                          node.id === selectedNodeId ? '#10b981' : 
                          node.id === searchingNodeId ? '#3b82f6' : '#d1d5db'}
                  strokeWidth={isUpdating ? "3" : "2"}
                />
                
                {/* 値表示 */}
                {isEditing ? (
                  <foreignObject x={position.x + 5} y={position.y + cellHeight/2 - 15}
                    width={cellWidth - 10} height="30">
                    <div className="h-full w-full flex items-center justify-center">
                      <input
                        type="text" value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full h-full border rounded px-1 text-center"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </foreignObject>
                ) : (
                  <text x={position.x + cellWidth / 2} y={position.y + cellHeight / 2}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="18" fontWeight="bold">
                    {node.value}
                  </text>
                )}
                
                {/* 編集ボタン */}
                {isEditing && (
                  <>
                    <circle cx={position.x + cellWidth / 2 - 20} cy={position.y + cellHeight + 15} r="12"
                      fill="#10b981"
                      onClick={(e) => { e.stopPropagation(); confirmEdit(); }}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x={position.x + cellWidth / 2 - 20} y={position.y + cellHeight + 15}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize="14" fill="white" fontWeight="bold">
                      ✓
                    </text>
                    
                    <circle cx={position.x + cellWidth / 2 + 20} cy={position.y + cellHeight + 15} r="12"
                      fill="#ef4444"
                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x={position.x + cellWidth / 2 + 20} y={position.y + cellHeight + 15}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize="14" fill="white" fontWeight="bold">
                      ✕
                    </text>
                  </>
                )}
              </g>
            );
          })}
          
          {/* メモリ領域表示 */}
          {displayNodes.length > 0 && (
            <g>
              <rect x={30} y={containerHeight - 30}
                width={Math.min(containerWidth - 60, displayNodes.length * (cellWidth + cellMargin * 2))}
                height={10} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"
              />
              <text x={30} y={containerHeight - 35} fontSize="10" fill="#4b5563">
                連続したメモリ領域
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  };
  
  // 操作コード例生成
  const generateCodeExample = () => {
    if (!lastOperation || !nodes.length) return null;
    
    // 基本情報収集
    const selectedNode = nodes.find(node => node.id === selectedNodeId);
    const nodeListStr = nodes.map(n => n.value).join(' -> ');
    let opValue = '';
    let oldValue = '';
    
    if (selectedNode) {
      opValue = selectedNode.value;
    }
    
    if (lastOperation === 'edit' && editingNode) {
      oldValue = editingNode.value;
      opValue = editValue;
    } else if (lastOperation === 'insert' || lastOperation.startsWith('insert_')) {
      opValue = newNodeValue || 'X';
    } else if (lastOperation === 'search') {
      opValue = searchValue || 'X';
    }
    
    // 簡略コード生成
    const listType = structureType === 'singly' ? '単方向' : 
                     structureType === 'doubly' ? '双方向' : 
                     structureType === 'circular' ? '循環' : '配列';
    
    const codeExamples = {
      'array': {
        'insert': `# 配列への挿入
array = [${nodes.map(n => n.value).join(', ')}]
array.insert(${arrayIndex || '0'}, "${opValue}")
print(f"挿入後: {array}")`,
        'delete': `# 配列からの削除
array = [${nodes.map(n => n.value).join(', ')}]
array.pop(${arrayIndex || '0'})`,
        'edit': `# 配列要素の更新
array = [${nodes.map(n => n.value).join(', ')}]
array[${arrayIndex || '0'}] = "${opValue}"`,
        'search': `# 配列での検索
array = [${nodes.map(n => n.value).join(', ')}]
for i, elem in enumerate(array):
    if elem == "${opValue}":
        print(f"値「{elem}」がインデックス{i}で見つかりました")
        break`
      },
      'list': {
        'insert_head': `# ${listType}リストの先頭に挿入
# 現在のリスト: ${nodeListStr}
new_node = Node("${opValue}")
new_node.next = head
head = new_node`,
        'insert_after': `# ${listType}リストの指定ノード後に挿入
# 現在のリスト: ${nodeListStr}
# "${opValue}" の後に挿入
current = head
while current:
    if current.value == "${opValue}":
        new_node = Node("X")
        new_node.next = current.next
        current.next = new_node
        break
    current = current.next`,
        'insert_tail': `# ${listType}リストの末尾に挿入
# 現在のリスト: ${nodeListStr}
new_node = Node("${opValue}")
if not head:
    head = new_node
else:
    current = head
    while current.next:
        current = current.next
    current.next = new_node`,
        'delete': `# ${listType}リストから「${opValue}」を削除
# 現在のリスト: ${nodeListStr}
if head.value == "${opValue}":  # 先頭の場合
    head = head.next
else:  # それ以外の場合
    current = head
    prev = None
    while current:
        if current.value == "${opValue}":
            prev.next = current.next
            break
        prev = current
        current = current.next`,
        'edit': `# ${listType}リストの値を更新
# 現在のリスト: ${nodeListStr}
# "${oldValue || 'A'}" を "${opValue}" に更新
current = head
while current:
    if current.value == "${oldValue || 'A'}":
        current.value = "${opValue}"
        break
    current = current.next`,
        'search': `# ${listType}リストで「${opValue}」を検索
# 現在のリスト: ${nodeListStr}
current = head
index = 0
while current:
    if current.value == "${opValue}":
        print(f"値「{opValue}」が見つかりました！")
        break
    current = current.next
    index += 1`
      }
    };
    
    const codeExample = structureType === 'array'
      ? codeExamples.array[lastOperation] || ''
      : codeExamples.list[lastOperation] || '';
    
    return codeExample;
  };
  
  // コード例表示
  const renderCodeExample = () => {
    const codeExample = generateCodeExample();
    return codeExample ? (
      <div className="mt-4 p-2 bg-gray-100 rounded">
        <pre className="whitespace-pre-wrap text-sm overflow-auto">
          {codeExample}
        </pre>
      </div>
    ) : null;
  };
  
  // メインUIレンダリング
  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-center mb-6">配列・連結リスト可視化</h1>
      
      {/* データ構造タイプ選択 */}
      <div className="mb-4 flex flex-wrap justify-center space-x-2 space-y-2 sm:space-y-0">
        <button
          className={`px-4 py-2 rounded-md ${structureType === 'singly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setStructureType('singly')}
          disabled={searchStep >= 0 || animating || editingNode}
        >
          単方向連結リスト
        </button>
        <button
          className={`px-4 py-2 rounded-md ${structureType === 'doubly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setStructureType('doubly')}
          disabled={searchStep >= 0 || animating || editingNode}
        >
          双方向連結リスト
        </button>
        <button
          className={`px-4 py-2 rounded-md ${structureType === 'circular' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setStructureType('circular')}
          disabled={searchStep >= 0 || animating || editingNode}
        >
          循環リスト
        </button>
        <button
          className={`px-4 py-2 rounded-md ${structureType === 'array' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setStructureType('array')}
          disabled={searchStep >= 0 || animating || editingNode}
        >
          配列
        </button>
      </div>
      
      {/* 操作パネル */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NodeControls
            newNodeValue={newNodeValue}
            setNewNodeValue={setNewNodeValue}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            structureType={structureType}
            selectedNodeId={selectedNodeId}
            arrayIndex={arrayIndex}
            setArrayIndex={setArrayIndex}
            nodes={nodes}
            editingNode={editingNode}
            searchStep={searchStep}
            animating={animating}
            handleInsert={handleInsert}
            handleInsertAtHead={handleInsertAtHead}
            handleInsertAtTail={handleInsertAtTail}
            handleSearch={handleSearch}
            handleDelete={handleDelete}
            startEditingNode={startEditingNode}
            resetList={resetList}
            toggleLayout={toggleLayout}
            wrapList={wrapList}
          />
          
          <MessagePanel
            animating={animating}
            animationFrames={animationFrames}
            currentFrame={currentFrame}
            message={message}
            selectedNodeId={selectedNodeId}
            editingNode={editingNode}
          />
        </div>
      </div>
      
      {/* リストの説明 */}
      <InstructionsPanel structureType={structureType} />
      
      {/* 表示エリア */}
      <div className="relative p-4 border rounded-lg bg-white shadow">
        {structureType === 'array' && <ArrayInfoPanel />}
        {structureType === 'array' ? renderArray() : renderLinkedList()}
        {lastOperation && renderCodeExample()}
      </div>
      
      {/* 解説 */}
      <InfoPanel structureType={structureType} />
    </div>
  );
};

export default DataStructureVisualizer;
