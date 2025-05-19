import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { artifactsData } from '../data/artifactsData';

// アーティファクトをLazy Loadingする
const artifactComponents: { [key: string]: React.LazyExoticComponent<React.ComponentType<any>> } = {
  'edit-distance': lazy(() => import('../artifacts/EditDistanceVisualizer')),
  'stack-queue': lazy(() => import('../artifacts/StackQueueVisualizer')),
  // 'remixed-6ecd48ff': lazy(() => import('../artifacts/UIComponentDemo')), // Old, to be replaced
  'remixed-6ecd48ff': lazy(() => import('../artifacts/KnapsackVisualizerEnhanced')),
  'data-structures': lazy(() => import('../artifacts/DataStructureVisualizer')), // Corrected path if needed, verify filename
  'interval-partitioning': lazy(() => import('../artifacts/IntervalPartitionVisualizer')), // Corrected path if needed, verify filename
  'greedy-algorithms': lazy(() => import('../artifacts/GreedyAlgorithmDemo')), // Corrected path if needed, verify filename
};

const getArtifactComponent = (artifactId: string): React.LazyExoticComponent<React.ComponentType<any>> | null => {
  switch (artifactId) {
    case 'edit-distance':
      return artifactComponents['edit-distance'];
    case 'stack-queue':
      return artifactComponents['stack-queue'];
    case 'remixed-6ecd48ff':
      return artifactComponents['remixed-6ecd48ff'];
    // case 'remixed-6ecd48ff':  // This was the original line for UIComponentDemo
    //   return lazy(() => import('../artifacts/UIComponentDemo'));
    case 'data-structures':
      // Assuming filename is DataStructureVisualizer.tsx
      return lazy(() => import('../artifacts/DataStructureVisualizer'));
    case 'interval-partitioning':
      // Assuming filename is IntervalPartitionVisualizer.tsx
      return lazy(() => import('../artifacts/IntervalPartitionVisualizer'));
    case 'greedy-algorithms':
      // Assuming filename is GreedyAlgorithmDemo.tsx
      return lazy(() => import('../artifacts/GreedyAlgorithmDemo'));
    default:
      console.warn(`Unknown artifactId: ${artifactId}`);
      return null;
  }
};

const ArtifactViewer: React.FC = () => {
  const { artifactId } = useParams<{ artifactId: string }>();
  const [ArtifactComponent, setArtifactComponent] = useState<React.LazyExoticComponent<React.ComponentType<any>> | null>(null);
  const [artifactInfo, setArtifactInfo] = useState<any>(null);

  useEffect(() => {
    if (artifactId) {
      // アーティファクト情報を取得
      const info = artifactsData.find(art => art.id === artifactId);
      setArtifactInfo(info);
      
      // コンポーネントをロード
      const component = getArtifactComponent(artifactId);
      setArtifactComponent(component);
    }
  }, [artifactId]);

  if (!artifactId || !artifactInfo) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <p className="text-yellow-700">
            アーティファクトが見つかりません。ID: {artifactId || 'なし'}
          </p>
        </div>
        <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
          アーティファクト一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-white hover:text-blue-100">
              ← アーティファクト一覧に戻る
            </Link>
            <h1 className="text-xl font-bold">{artifactInfo.name}</h1>
            <div className="w-32"></div> {/* 右側のバランスのためのスペーサー */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {ArtifactComponent && (
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          }>
            <ArtifactComponent />
          </Suspense>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Claude アーティファクト ギャラリー</p>
        </div>
      </footer>
    </div>
  );
};

export default ArtifactViewer;
