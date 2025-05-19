import { useState, useEffect } from 'react';
import { RotateCcw, Search, Plus, Trash, ChevronLeft, ChevronRight, Edit, ArrowRight, ArrowLeft } from 'lucide-react';

// メインコンポーネント
const StackQueueVisualizer = () => {
  // 状態管理
  const [structureType, setStructureType] = useState('stack');
  const [elements, setElements] = useState([]);
  const [elementIdCounter, setElementIdCounter] = useState(0);
  const [newElementValue, setNewElementValue] = useState('');
  const [messageContent, setMessageContent] = useState('操作するにはボタンを使用してください。');
  
  // アニメーション状態
  const [animating, setAnimating] = useState(false);
  const [animationFrames, setAnimationFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  // 操作履歴
  const [operationHistory, setOperationHistory] = useState([]);
  const [lastOperation, setLastOperation] = useState(null);
  
  // 表示設定
  const [horizontalLayout, setHorizontalLayout] = useState(false);

  // 初期化
  useEffect(() => {
    resetStructure();
  }, [structureType]);
  
  // アニメーション制御
  useEffect(() => {
    if (animating && animationFrames.length > 0) {
      if (currentFrameIndex < animationFrames.length) {
        const timer = setTimeout(() => {
          setCurrentFrameIndex(currentFrameIndex + 1);
        }, 700);
        return () => clearTimeout(timer);
      } else {
        setAnimating(false);
      }
    }
  }, [animating, animationFrames, currentFrameIndex]);
  
  // ID生成
  const generateId = () => {
    const newId = elementIdCounter;
    setElementIdCounter(prev => prev + 1);
    return newId;
  };
  
  // リセット
  const resetStructure = () => {
    const sampleElements = [
      { id: 1, value: 'A' },
      { id: 2, value: 'B' },
      { id: 3, value: 'C' }
    ];
    
    setElements(sampleElements);
    setElementIdCounter(4);
    setMessageContent(`${getStructureTypeName()}を操作するにはボタンを使用してください。`);
    setAnimating(false);
    setAnimationFrames([]);
    setCurrentFrameIndex(0);
    setOperationHistory([]);
    setLastOperation(null);
  };
  
  // 構造タイプ名の取得
  const getStructureTypeName = () => {
    return structureType === 'stack' ? 'スタック' : 'キュー';
  };
  
  // Push操作
  const handlePush = () => {
    if (!newElementValue.trim()) {
      setMessageContent('要素の値を入力してください。');
      return;
    }
    
    if (animating) return;
    
    const newElement = { id: generateId(), value: newElementValue };
    
    // アニメーションフレーム設定
    const frames = [
      { 
        elements: [...elements], 
        message: `${structureType === 'stack' ? 'Push' : 'Enqueue'}: 新しい要素「${newElement.value}」を${structureType === 'stack' ? '上部に追加' : '末尾に追加'}します。`, 
        highlightedId: null, 
        phase: 'start' 
      },
      { 
        elements: [...elements, newElement], 
        message: `${structureType === 'stack' ? 'Push' : 'Enqueue'}: 要素「${newElement.value}」を追加しました。`, 
        highlightedId: newElement.id, 
        phase: 'complete' 
      }
    ];
    
    setAnimationFrames(frames);
    setCurrentFrameIndex(0);
    setAnimating(true);
    
    // 履歴追加
    const historyItem = {
      operation: structureType === 'stack' ? 'push' : 'enqueue',
      element: newElement,
      time: new Date().toLocaleTimeString()
    };
    setOperationHistory([historyItem, ...operationHistory.slice(0, 9)]);
    setLastOperation(structureType === 'stack' ? 'push' : 'enqueue');
    
    setTimeout(() => {
      setElements([...elements, newElement]);
      setNewElementValue('');
    }, frames.length * 700);
  };
  
  // Pop操作
  const handlePop = () => {
    if (elements.length === 0) {
      setMessageContent(`${getStructureTypeName()}が空です。要素を追加してください。`);
      return;
    }
    
    if (animating) return;
    
    let removedElement, newElements;
    if (structureType === 'stack') {
      // スタックはLIFO: 末尾(上部)から削除
      removedElement = elements[elements.length - 1];
      newElements = elements.slice(0, elements.length - 1);
    } else {
      // キューはFIFO: 先頭から削除
      removedElement = elements[0];
      newElements = elements.slice(1);
    }
    
    // アニメーションフレーム設定
    const frames = [
      { 
        elements: [...elements], 
        message: `${structureType === 'stack' ? 'Pop' : 'Dequeue'}: 要素「${removedElement.value}」を${structureType === 'stack' ? '上部から' : '先頭から'}取り出します。`, 
        highlightedId: removedElement.id, 
        phase: 'start' 
      },
      { 
        elements: newElements, 
        message: `${structureType === 'stack' ? 'Pop' : 'Dequeue'}: 要素「${removedElement.value}」を取り出しました。${elements.length > 1 ? `${structureType === 'stack' ? '新しい先頭' : '新しい末尾'}は「${structureType === 'stack' ? newElements[newElements.length - 1]?.value : newElements[0]?.value}」です。` : `${getStructureTypeName()}は空になりました。`}`, 
        highlightedId: null, 
        removedElement: removedElement,
        phase: 'complete' 
      }
    ];
    
    setAnimationFrames(frames);
    setCurrentFrameIndex(0);
    setAnimating(true);
    
    // 履歴追加
    const historyItem = {
      operation: structureType === 'stack' ? 'pop' : 'dequeue',
      element: removedElement,
      time: new Date().toLocaleTimeString()
    };
    setOperationHistory([historyItem, ...operationHistory.slice(0, 9)]);
    setLastOperation(structureType === 'stack' ? 'pop' : 'dequeue');
    
    setTimeout(() => {
      setElements(newElements);
    }, frames.length * 700);
  };
  
  // Peek操作
  const handlePeek = () => {
    if (elements.length === 0) {
      setMessageContent(`${getStructureTypeName()}が空です。要素を追加してください。`);
      return;
    }
    
    if (animating) return;
    
    // スタックとキューで参照位置が異なる
    const peekedElement = structureType === 'stack' ? 
      elements[elements.length - 1] : elements[0];
    
    setMessageContent(`${structureType === 'stack' ? 'Peek' : 'Front'}: 現在の${structureType === 'stack' ? '上部' : '先頭'}は要素「${peekedElement.value}」です。`);
    
    // アニメーションフレーム設定
    const frames = [
      { 
        elements: [...elements], 
        message: `${structureType === 'stack' ? 'Peek' : 'Front'}: ${structureType === 'stack' ? '上部' : '先頭'}の要素「${peekedElement.value}」を参照します（取り出しは行いません）。`, 
        highlightedId: peekedElement.id, 
        phase: 'peek' 
      }
    ];
    
    setAnimationFrames(frames);
    setCurrentFrameIndex(0);
    setAnimating(true);
    
    // 履歴追加
    const historyItem = {
      operation: structureType === 'stack' ? 'peek' : 'front',
      element: peekedElement,
      time: new Date().toLocaleTimeString()
    };
    setOperationHistory([historyItem, ...operationHistory.slice(0, 9)]);
    setLastOperation(structureType === 'stack' ? 'peek' : 'front');
  };
  
  // レイアウト切替
  const toggleLayout = () => {
    setHorizontalLayout(!horizontalLayout);
  };
  
  // 表示要素取得
  const getCurrentElementsForDisplay = () => {
    if (!animating || animationFrames.length === 0) {
      return elements;
    }
    
    const frame = animationFrames[Math.min(currentFrameIndex, animationFrames.length - 1)];
    return frame?.elements || elements;
  };
  
  // 現在のアニメーションフレーム取得
  const getCurrentFrame = () => {
    if (!animating || animationFrames.length === 0) {
      return null;
    }
    return animationFrames[Math.min(currentFrameIndex, animationFrames.length - 1)];
  };
  
  // スタック描画
  const renderStack = () => {
    const displayElements = getCurrentElementsForDisplay();
    
    if (displayElements.length === 0) {
      return <div className="text-center py-4">スタックは空です。要素を追加してください。</div>;
    }
    
    const currentFrame = getCurrentFrame();
    
    // 横表示と縦表示のレイアウト設定
    if (horizontalLayout) {
      // 横表示（横向きのスタック）
      return (
        <div className="flex flex-row-reverse items-center justify-start h-64 overflow-auto p-4">
          {displayElements.map((element, index) => (
            <div 
              key={element.id}
              className={`relative flex items-center justify-center border-2 m-1 w-16 h-16 transition-all duration-200
                ${element.id === currentFrame?.highlightedId ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}
            >
              <div className="text-lg font-bold">{element.value}</div>
              {index === 0 && (
                <div className="absolute -left-16 text-xs font-semibold text-gray-500">
                  {structureType === 'stack' ? '先頭 (Bottom)' : '出口 (Dequeue)'}
                </div>
              )}
              {index === displayElements.length - 1 && (
                <div className="absolute -right-16 text-xs font-semibold text-gray-500">
                  {structureType === 'stack' ? '上部 (Top)' : '入口 (Enqueue)'}
                </div>
              )}
              {(structureType === 'stack' && index === displayElements.length - 1) && (
                <div className="absolute -top-7 left-0 right-0 text-center text-xs font-semibold text-green-600">
                  ← Push/Pop
                </div>
              )}
              {(structureType === 'queue' && index === 0) && (
                <div className="absolute -bottom-7 left-0 right-0 text-center text-xs font-semibold text-green-600">
                  Dequeue →
                </div>
              )}
              {(structureType === 'queue' && index === displayElements.length - 1) && (
                <div className="absolute -top-7 left-0 right-0 text-center text-xs font-semibold text-green-600">
                  ← Enqueue
                </div>
              )}
            </div>
          ))}
          
          {/* アクセス方向の矢印 */}
          {structureType === 'queue' && displayElements.length > 0 && (
            <div className="absolute top-1/2 transform -translate-y-1/2 right-4 text-blue-500">
              <ArrowLeft size={24} />
            </div>
          )}
        </div>
      );
    } else {
      // 縦表示（垂直のスタック）
      return (
        <div className="flex flex-col-reverse items-center justify-start mb-4">
          {displayElements.map((element, index) => (
            <div 
              key={element.id}
              className={`relative flex items-center justify-center border-2 m-1 w-64 h-16 transition-all duration-200
                ${element.id === currentFrame?.highlightedId ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}
            >
              <div className="text-lg font-bold">{element.value}</div>
              {index === 0 && (
                <div className="absolute -bottom-7 text-xs font-semibold text-gray-500">
                  {structureType === 'stack' ? '先頭 (Bottom)' : '出口 (Dequeue)'}
                </div>
              )}
              {index === displayElements.length - 1 && (
                <div className="absolute -top-7 text-xs font-semibold text-gray-500">
                  {structureType === 'stack' ? '上部 (Top)' : '入口 (Enqueue)'}
                </div>
              )}
              {(structureType === 'stack' && index === displayElements.length - 1) && (
                <div className="absolute -right-24 text-xs font-semibold text-green-600">
                  ↑ Push/Pop
                </div>
              )}
              {(structureType === 'queue' && index === 0) && (
                <div className="absolute -right-24 text-xs font-semibold text-green-600">
                  ↓ Dequeue
                </div>
              )}
              {(structureType === 'queue' && index === displayElements.length - 1) && (
                <div className="absolute -right-24 text-xs font-semibold text-green-600">
                  ↑ Enqueue
                </div>
              )}
            </div>
          ))}
          
          {/* アクセス方向の矢印 */}
          {structureType === 'queue' && displayElements.length > 0 && (
            <div className="absolute left-1/2 transform -translate-x-1/2 mb-2 text-blue-500">
              <ArrowRight size={24} className="rotate-90" />
            </div>
          )}
        </div>
      );
    }
  };
  
  // キュー描画
  const renderQueue = () => {
    const displayElements = getCurrentElementsForDisplay();
    
    if (displayElements.length === 0) {
      return <div className="text-center py-4">キューは空です。要素を追加してください。</div>;
    }
    
    const currentFrame = getCurrentFrame();
    
    // 横表示と縦表示のレイアウト設定
    if (horizontalLayout) {
      // 横表示（横向きのキュー）
      return (
        <div className="flex flex-row items-center justify-start h-64 overflow-auto p-4">
          {displayElements.map((element, index) => (
            <div 
              key={element.id}
              className={`relative flex items-center justify-center border-2 m-1 w-16 h-16 transition-all duration-200
                ${element.id === currentFrame?.highlightedId ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}
            >
              <div className="text-lg font-bold">{element.value}</div>
              {index === 0 && (
                <div className="absolute -left-7 text-xs font-semibold text-gray-500 rotate-90">
                  出口 (Front)
                </div>
              )}
              {index === displayElements.length - 1 && (
                <div className="absolute -right-7 text-xs font-semibold text-gray-500 rotate-90">
                  入口 (Rear)
                </div>
              )}
              {index === 0 && (
                <div className="absolute -bottom-7 left-0 right-0 text-center text-xs font-semibold text-green-600">
                  Dequeue ↓
                </div>
              )}
              {index === displayElements.length - 1 && (
                <div className="absolute -top-7 left-0 right-0 text-center text-xs font-semibold text-green-600">
                  Enqueue ↑
                </div>
              )}
            </div>
          ))}
          
          {/* アクセス方向の矢印 */}
          {displayElements.length > 0 && (
            <div className="absolute top-1/2 transform -translate-y-1/2 right-4 text-blue-500">
              <ArrowRight size={24} />
            </div>
          )}
        </div>
      );
    } else {
      // 縦表示（垂直のキュー）
      return (
        <div className="flex flex-col items-center justify-start mb-4">
          {displayElements.map((element, index) => (
            <div 
              key={element.id}
              className={`relative flex items-center justify-center border-2 m-1 w-64 h-16 transition-all duration-200
                ${element.id === currentFrame?.highlightedId ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}
            >
              <div className="text-lg font-bold">{element.value}</div>
              {index === 0 && (
                <div className="absolute -top-7 text-xs font-semibold text-gray-500">
                  出口 (Front)
                </div>
              )}
              {index === displayElements.length - 1 && (
                <div className="absolute -bottom-7 text-xs font-semibold text-gray-500">
                  入口 (Rear)
                </div>
              )}
              {index === 0 && (
                <div className="absolute -right-24 text-xs font-semibold text-green-600">
                  ← Dequeue
                </div>
              )}
              {index === displayElements.length - 1 && (
                <div className="absolute -right-24 text-xs font-semibold text-green-600">
                  → Enqueue
                </div>
              )}
            </div>
          ))}
          
          {/* アクセス方向の矢印 */}
          {displayElements.length > 0 && (
            <div className="absolute left-1/2 transform -translate-x-1/2 my-2 text-blue-500">
              <ArrowRight size={24} />
            </div>
          )}
        </div>
      );
    }
  };
  
  // 操作履歴表示
  const renderOperationHistory = () => {
    return (
      <div className="mt-4 p-2 bg-gray-50 rounded border">
        <h3 className="font-bold text-sm mb-2">操作履歴</h3>
        {operationHistory.length === 0 ? (
          <p className="text-sm text-gray-500">履歴はありません</p>
        ) : (
          <ul className="text-sm space-y-1">
            {operationHistory.map((item, index) => (
              <li key={index} className="border-b border-gray-100 pb-1">
                <span className="text-xs text-gray-500">{item.time}</span>
                {' '}
                <span className={`font-semibold 
                  ${item.operation === 'push' || item.operation === 'enqueue' ? 'text-green-600' : 
                    item.operation === 'pop' || item.operation === 'dequeue' ? 'text-red-600' : 
                    'text-blue-600'}`}>
                  {item.operation}
                </span>
                {' '}
                <span>{item.element.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  // アニメーションメッセージ表示
  const renderMessage = () => {
    const currentFrame = getCurrentFrame();
    const displayMessage = currentFrame ? currentFrame.message : messageContent;
    
    return (
      <div className="p-2 border rounded bg-gray-50 min-h-10 mb-4">
        {displayMessage}
        {animating && animationFrames.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            アニメーション: {currentFrameIndex + 1}/{animationFrames.length}
          </div>
        )}
      </div>
    );
  };
  
  // コード例表示
  const generateCodeExample = () => {
    if (!lastOperation || !elements.length) return null;
    
    const examples = {
      'stack': {
        'push': `# スタックへの要素追加 (Push)
stack = [${elements.map(e => `"${e.value}"`).join(', ')}]
stack.append("${newElementValue || 'X'}")  # 末尾に追加
print(f"Push後: {stack}")`,
        'pop': `# スタックからの要素取り出し (Pop)
stack = [${elements.map(e => `"${e.value}"`).join(', ')}]
popped_value = stack.pop()  # 末尾から取り出し
print(f"Pop取り出し値: {popped_value}")
print(f"Pop後: {stack}")`,
        'peek': `# スタックの上部要素参照 (Peek)
stack = [${elements.map(e => `"${e.value}"`).join(', ')}]
top_value = stack[-1]  # インデックス-1は末尾要素
print(f"スタック上部の要素: {top_value}")`,
      },
      'queue': {
        'enqueue': `# キューへの要素追加 (Enqueue)
from collections import deque
queue = deque([${elements.map(e => `"${e.value}"`).join(', ')}])
queue.append("${newElementValue || 'X'}")  # 末尾に追加
print(f"Enqueue後: {queue}")`,
        'dequeue': `# キューからの要素取り出し (Dequeue)
from collections import deque
queue = deque([${elements.map(e => `"${e.value}"`).join(', ')}])
dequeued_value = queue.popleft()  # 先頭から取り出し
print(f"Dequeue取り出し値: {dequeued_value}")
print(f"Dequeue後: {queue}")`,
        'front': `# キューの先頭要素参照 (Front)
from collections import deque
queue = deque([${elements.map(e => `"${e.value}"`).join(', ')}])
front_value = queue[0]  # インデックス0は先頭要素
print(f"キュー先頭の要素: {front_value}")`,
      }
    };
    
    return examples[structureType][lastOperation] || null;
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

  // データ構造情報パネル
  const renderInfoPanel = () => (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <h3 className="font-bold mb-2">データ構造の説明</h3>
      
      {structureType === 'stack' ? (
        <div>
          <p className="mb-2">
            <strong>スタック (Stack):</strong> 後入れ先出し (LIFO: Last-In-First-Out) の原則で動作するデータ構造です。
            新しい要素は常にスタックの上部に追加され、取り出す際も上部から行われます。
          </p>
          <p className="text-sm">
            主な操作:
            <ul className="list-disc pl-5 mt-1">
              <li><strong>Push:</strong> スタックの上部に要素を追加（O(1)）</li>
              <li><strong>Pop:</strong> スタックの上部から要素を取り出す（O(1)）</li>
              <li><strong>Peek:</strong> 上部の要素を参照するが取り出さない（O(1)）</li>
            </ul>
          </p>
          <p className="text-sm mt-2">
            使用例:
            <ul className="list-disc pl-5 mt-1">
              <li>関数呼び出しのコールスタック</li>
              <li>ブラウザの「戻る」ボタン履歴</li>
              <li>式の評価（逆ポーランド記法など）</li>
              <li>深さ優先探索アルゴリズム</li>
            </ul>
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-2">
            <strong>キュー (Queue):</strong> 先入れ先出し (FIFO: First-In-First-Out) の原則で動作するデータ構造です。
            新しい要素は常にキューの末尾に追加され、取り出す際は先頭から行われます。
          </p>
          <p className="text-sm">
            主な操作:
            <ul className="list-disc pl-5 mt-1">
              <li><strong>Enqueue:</strong> キューの末尾に要素を追加（O(1)）</li>
              <li><strong>Dequeue:</strong> キューの先頭から要素を取り出す（O(1)）</li>
              <li><strong>Front:</strong> 先頭の要素を参照するが取り出さない（O(1)）</li>
            </ul>
          </p>
          <p className="text-sm mt-2">
            使用例:
            <ul className="list-disc pl-5 mt-1">
              <li>プリンタのジョブキュー</li>
              <li>CPUのタスクスケジューリング</li>
              <li>メッセージキュー（非同期処理）</li>
              <li>幅優先探索アルゴリズム</li>
              <li>イベント処理システム</li>
            </ul>
          </p>
        </div>
      )}
      
      <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-bold text-sm">実装上のポイント</h4>
        <p className="text-xs mt-1">
          {structureType === 'stack' ? (
            <>
              Pythonではリスト(list)を使ってスタックを簡単に実装できます。append()でPush、pop()でPopを行います。
              JavaScriptでは配列(Array)のpush()とpop()メソッドでスタック操作が可能です。
            </>
          ) : (
            <>
              Pythonではcollections.dequeが効率的なキュー実装を提供します。append()でEnqueue、popleft()でDequeueを行います。
              JavaScriptでは単純な配列だとDequeueが非効率（O(n)）なので、連結リストや専用ライブラリの使用を検討します。
            </>
          )}
        </p>
      </div>
    </div>
  );
  
  // メインUIレンダリング
  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-center mb-6">スタックとキュー可視化</h1>
      
      {/* データ構造タイプ選択 */}
      <div className="mb-4 flex justify-center space-x-4">
        <button
          className={`px-6 py-2 rounded-md ${structureType === 'stack' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setStructureType('stack')}
          disabled={animating}
        >
          スタック (LIFO)
        </button>
        <button
          className={`px-6 py-2 rounded-md ${structureType === 'queue' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setStructureType('queue')}
          disabled={animating}
        >
          キュー (FIFO)
        </button>
      </div>
      
      {/* 操作パネル */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 操作コントロール */}
          <div>
            <h3 className="font-bold mb-2">操作パネル</h3>
            <div className="flex flex-col space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newElementValue}
                  onChange={(e) => setNewElementValue(e.target.value)}
                  placeholder="要素の値"
                  className="border px-2 py-1 rounded flex-grow"
                  disabled={animating}
                />
                <button
                  onClick={handlePush}
                  className="bg-green-500 text-white px-3 py-1 rounded flex items-center"
                  disabled={animating}
                >
                  <Plus size={16} className="mr-1" /> 
                  {structureType === 'stack' ? 'Push' : 'Enqueue'}
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handlePop}
                  className="bg-red-500 text-white px-3 py-1 rounded flex items-center"
                  disabled={animating || elements.length === 0}
                >
                  <Trash size={16} className="mr-1" /> 
                  {structureType === 'stack' ? 'Pop' : 'Dequeue'}
                </button>
                <button
                  onClick={handlePeek}
                  className="bg-blue-500 text-white px-3 py-1 rounded flex items-center"
                  disabled={animating || elements.length === 0}
                >
                  <Search size={16} className="mr-1" /> 
                  {structureType === 'stack' ? 'Peek' : 'Front'}
                </button>
                <button
                  onClick={resetStructure}
                  className="bg-gray-500 text-white px-3 py-1 rounded flex items-center"
                  disabled={animating}
                >
                  <RotateCcw size={16} className="mr-1" /> リセット
                </button>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={toggleLayout}
                  className={`${horizontalLayout ? 'bg-indigo-500' : 'bg-gray-400'} text-white px-3 py-1 rounded flex items-center`}
                  disabled={animating}
                >
                  {horizontalLayout ? <ChevronLeft size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
                  {horizontalLayout ? '横表示' : '縦表示'}
                </button>
              </div>
            </div>
          </div>
          
          {/* メッセージパネル */}
          <div>
            <h3 className="font-bold mb-2">操作メッセージ</h3>
            {renderMessage()}
            {renderOperationHistory()}
          </div>
        </div>
      </div>
      
      {/* 表示エリア */}
      <div className="p-4 border rounded-lg bg-white shadow">
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-300 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>{getStructureTypeName()}の特徴:</strong> {structureType === 'stack' ? (
              '後入れ先出し (LIFO: Last-In-First-Out) データ構造。最後に挿入された要素が最初に取り出されます。'
            ) : (
              '先入れ先出し (FIFO: First-In-First-Out) データ構造。最初に挿入された要素が最初に取り出されます。'
            )}
          </p>
        </div>
        
        {structureType === 'stack' ? renderStack() : renderQueue()}
        
        {lastOperation && renderCodeExample()}
      </div>
      
      {/* 解説 */}
      {renderInfoPanel()}
    </div>
  );
};

export default StackQueueVisualizer;
