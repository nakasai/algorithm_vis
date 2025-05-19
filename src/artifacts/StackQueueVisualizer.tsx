import React, { useState, useEffect } from 'react';

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

  // メインUIレンダリング
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.h1 
        className="text-3xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        スタックとキュー可視化
      </motion.h1>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="text-lg font-semibold text-blue-700">スタックとキューとは</h2>
        <p className="mt-1">
          スタックは後入れ先出し（LIFO）、キューは先入れ先出し（FIFO）のデータ構造です。
          この可視化では、基本操作をインタラクティブに体験できます。
        </p>
      </div>
      
      {/* 制御パネル */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">アニメーション速度</Label>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm">遅い</span>
                <Slider
                  value={[speed]}
                  min={0.5}
                  max={3}
                  step={0.5}
                  onValueChange={handleSpeedChange}
                  disabled={isComplete}
                  className="flex-grow"
                />
                <span className="text-sm">速い</span>
              </div>
            </div>
            
            <div className="flex items-end">
              <div>
                <Toggle
                  pressed={showCode}
                  onPressedChange={setShowCode}
                >
                  コードを{showCode ? '非表示' : '表示'}
                </Toggle>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={step === 0 || isPlaying}
            >
              <StepBack className="w-4 h-4 mr-1" /> 
              前へ
            </Button>
            
            <Button
              variant={isPlaying ? "secondary" : "default"}
              size="sm"
              onClick={togglePlayPause}
              disabled={isComplete || step >= totalSteps}
            >
              {isPlaying 
                ? <><Pause className="w-4 h-4 mr-1" /> 一時停止</> 
                : <><Play className="w-4 h-4 mr-1" /> 再生</>}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextStep}
              disabled={isComplete || step >= totalSteps || isPlaying}
            >
              次へ <StepForward className="w-4 h-4 ml-1" />
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => setStep(totalSteps)}
              disabled={isComplete || step >= totalSteps || isPlaying}
            >
              <FastForward className="w-4 h-4 mr-1" />
              計算完了
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetVisualization}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              リセット
            </Button>
          </div>
          
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            {getCurrentStepDescription()}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {renderStack()}
          {renderQueue()}
          {renderCode()}
        </div>
        
        <div className="lg:col-span-1">
          {renderOperationHistory()}
        </div>
      </div>
    </div>
  );
};

export default StackQueueVisualizer;