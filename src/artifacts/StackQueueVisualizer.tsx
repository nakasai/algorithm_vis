import React, { useState, useEffect } from 'react';

// 型定義を追加
interface Element {
  id: number;
  value: string;
}

// メインコンポーネント
const StackQueueVisualizer: React.FC = () => {
  // 状態管理
  const [structureType, setStructureType] = useState('stack');
  const [elements, setElements] = useState<Element[]>([]); // 型を明示的に定義
  const [elementIdCounter, setElementIdCounter] = useState(0);
  const [newElementValue, setNewElementValue] = useState('');
  const [messageContent, setMessageContent] = useState('操作するにはボタンを使用してください。');
  
  // アニメーション状態
  const [animating, setAnimating] = useState(false);
  const [animationFrames, setAnimationFrames] = useState<any[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  // 操作履歴
  const [operationHistory, setOperationHistory] = useState<any[]>([]);
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  
  // 表示設定
  const [horizontalLayout, setHorizontalLayout] = useState(false);

  // 初期化
  useEffect(() => {
    resetStructure();
  }, [structureType]);
  
  // リセット
  const resetStructure = () => {
    // 明示的に型付きの配列を作成
    const sampleElements: Element[] = [
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">スタックとキュー可視化</h1>
      <p className="mb-4">
        このデモではスタックとキューの基本操作を視覚的に確認できます。
        「スタック」か「キュー」を選択し、要素の追加や削除を試してください。
      </p>
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
      <div className="p-4 bg-yellow-100 rounded">
        <p>このアーティファクトは現在実装中です。詳細な機能は近日公開予定です。</p>
      </div>
    </div>
  );
};

export default StackQueueVisualizer;