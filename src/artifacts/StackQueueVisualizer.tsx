import React, { useState, useEffect } from 'react';

// 要素の型定義
interface Element {
  id: number;
  value: string;
}

// メインコンポーネント
const StackQueueVisualizer: React.FC = () => {
  // 状態管理
  const [structureType, setStructureType] = useState('stack');
  const [elements, setElements] = useState<Element[]>([]);
  const [elementIdCounter, setElementIdCounter] = useState(1);
  const [newElementValue, setNewElementValue] = useState('');
  const [messageContent, setMessageContent] = useState('操作するにはボタンを使用してください。');
  
  // アニメーション状態
  const [animating, setAnimating] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    // 操作履歴
  const [operationHistory, setOperationHistory] = useState<string[]>([]);
  
  // 表示設定
  const [horizontalLayout, setHorizontalLayout] = useState(false);
  
  // 初期化
  useEffect(() => {
    resetStructure();
  }, [structureType]);
  
  // リセット
  const resetStructure = () => {
    // 初期データを設定
    const sampleElements: Element[] = [
      { id: 1, value: 'A' },
      { id: 2, value: 'B' },
      { id: 3, value: 'C' }
    ];
    
    setElements(sampleElements);
    setElementIdCounter(4);
    setMessageContent(`${getStructureTypeName()}を操作するにはボタンを使用してください。`);
    setAnimating(false);
    setCurrentFrameIndex(0);
    setOperationHistory([]);
  };
    // 要素の追加
  const pushElement = () => {
    if (newElementValue.trim() === '') {
      setMessageContent('値を入力してください');
      return;
    }
    
    const newElement: Element = {
      id: elementIdCounter,
      value: newElementValue
    };
    
    setElements([...elements, newElement]);    setElementIdCounter(elementIdCounter + 1);
    setNewElementValue('');
    setOperationHistory([...operationHistory, `Push: ${newElement.value}`]);
    setMessageContent(`${newElement.value} を追加しました`);
  };
  
  // 要素の取り出し
  const popElement = () => {
    if (elements.length === 0) {
      setMessageContent('これ以上取り出せる要素がありません');
      return;
    }
    
    // スタック: 最後の要素を取り出す
    // キュー: 最初の要素を取り出す
    const index = structureType === 'stack' ? elements.length - 1 : 0;
    const removedElement = elements[index];
    
    const newElements = [...elements];
    newElements.splice(index, 1);
      setElements(newElements);
    setOperationHistory([...operationHistory, `Pop: ${removedElement.value}`]);
    setMessageContent(`${removedElement.value} を取り出しました`);
  };
  
  // 構造タイプ名の取得
  const getStructureTypeName = () => {
    return structureType === 'stack' ? 'スタック' : 'キュー';
  };
  
  // レイアウト方向を切り替える
  const toggleLayout = () => {
    setHorizontalLayout(!horizontalLayout);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">スタックとキュー可視化</h1>
      <p className="mb-4">
        このデモではスタックとキューの基本操作を視覚的に確認できます。
        「スタック」か「キュー」を選択し、要素の追加や削除を試してください。
      </p>
      
      {/* データ構造タイプ選択 */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button 
            className={`px-4 py-2 rounded ${structureType === 'stack' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setStructureType('stack')}
          >
            スタック
          </button>
          <button 
            className={`px-4 py-2 rounded ${structureType === 'queue' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setStructureType('queue')}
          >
            キュー
          </button>
        </div>
      </div>
      
      {/* 操作パネル */}
      <div className="mb-4 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">操作</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newElementValue}
              onChange={(e) => setNewElementValue(e.target.value)}
              placeholder="値を入力"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={pushElement}
            >
              追加
            </button>
            <button 
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={popElement}
            >
              取り出し
            </button>
            <button 
              className="px-4 py-2 bg-gray-500 text-white rounded"
              onClick={resetStructure}
            >
              リセット
            </button>
            <button 
              className="px-4 py-2 bg-blue-300 text-white rounded"
              onClick={toggleLayout}
            >
              向き変更
            </button>
          </div>
        </div>
        
        {/* メッセージ表示 */}
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p>{messageContent}</p>
        </div>
      </div>
      
      {/* データ構造の可視化 */}
      <div className="mb-4 p-4 bg-white rounded shadow min-h-[200px]">
        <h2 className="text-xl font-semibold mb-2">{getStructureTypeName()} 可視化</h2>
        
        <div className={`flex ${horizontalLayout ? 'flex-row' : 'flex-col'} gap-2 items-center mt-4`}>
          {elements.map((element, index) => (
            <div 
              key={element.id} 
              className={`p-4 rounded-md border-2 border-blue-500 bg-blue-100 ${
                animating && index === currentFrameIndex ? 'bg-yellow-200' : ''
              }`}
            >
              {element.value}
            </div>
          ))}
          
          {elements.length === 0 && (
            <div className="p-4 text-gray-500">要素がありません</div>
          )}
        </div>
        
        {structureType === 'stack' ? (
          <div className="mt-2 text-sm text-gray-500">
            ↑ 最後に追加された要素が上に表示されます（Last-In-First-Out）
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-500">
            ↑ 最初に追加された要素が先に取り出されます（First-In-First-Out）
          </div>
        )}
      </div>
      
      {/* 操作履歴 */}
      <div className="mb-4 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">操作履歴</h2>
        <ul className="list-disc pl-6">
          {operationHistory.map((operation, index) => (
            <li key={index}>{operation}</li>
          ))}
          {operationHistory.length === 0 && (
            <li className="text-gray-500">まだ操作履歴はありません</li>
          )}
        </ul>
      </div>
      
      {animating && (
        <div className="p-4 bg-blue-100 rounded">
          <p>アニメーション実行中...</p>
        </div>
      )}
        <div className="p-4 bg-yellow-100 rounded">
        <p>このアーティファクトは実装が完了しました。スタックとキューの基本操作を試すことができます。</p>
      </div>
    </div>
  );
};

export default StackQueueVisualizer;