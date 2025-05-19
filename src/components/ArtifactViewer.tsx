import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { artifactsData } from '../data/artifactsData';

// アーティファクトをLazy Loadingする
const loadArtifact = (artifactId: string) => {
  switch (artifactId) {
    case 'remixed-6ecd48ff':
      return lazy(() => import('../artifacts/UIComponentDemo'));
    case 'remixed-e2a07c44':
      return lazy(() => import('../artifacts/EditDistanceVisualizer'));
    case 'remixed-de94d2fd':
      return lazy(() => import('../artifacts/StackQueueVisualizer'));
    case 'remixed-ce646c59':
      return lazy(() => import('../artifacts/DataStructureVisualizer'));
    case 'remixed-162045d8':
      return lazy(() => import('../artifacts/IntervalPartitionVisualizer'));
    case 'remixed-9392be62':
      return lazy(() => import('../artifacts/GreedyAlgorithmDemo'));
    default:
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
      const component = loadArtifact(artifactId);
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
