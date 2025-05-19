import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { artifactsData } from '../data/artifactsData';

const ArtifactList: React.FC = () => {
  // アーティファクトのリスト
  const artifacts = artifactsData;

  // アーティファクトの種類
  const categories = [
    { id: 'all', name: 'すべて' },
    { id: 'algorithm', name: 'アルゴリズム' },
    { id: 'datastructure', name: 'データ構造' },
    { id: 'ui', name: 'UI' }
  ];

  // アーティファクトとカテゴリーのマッピング
  const artifactCategories = {
    'remixed-6ecd48ff': ['ui'],
    'remixed-e2a07c44': ['algorithm'],
    'remixed-de94d2fd': ['datastructure'],
    'remixed-ce646c59': ['datastructure'],
    'remixed-162045d8': ['algorithm'],
    'remixed-9392be62': ['algorithm']
  };

  // 現在選択されているカテゴリー
  const [activeCategory, setActiveCategory] = useState('all');
  // 現在表示されているアーティファクト
  const [filteredArtifacts, setFilteredArtifacts] = useState(artifacts);

  // カテゴリーフィルター処理
  const filterByCategory = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') {
      setFilteredArtifacts(artifacts);
    } else {
      setFilteredArtifacts(
        artifacts.filter(artifact => 
          artifactCategories[artifact.id]?.includes(category)
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">Claude アーティファクト ギャラリー</h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Anthropic社のClaudeを使って生成したインタラクティブなReactアプリケーション集
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* カテゴリーフィルター */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">カテゴリー</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => filterByCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* アーティファクト一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtifacts.map((artifact) => (
            <motion.div
              key={artifact.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <img
                  src={`${process.env.NODE_ENV === 'production' ? '/algorithm_vis' : ''}/images/${artifact.image || 'placeholder.png'}`} 
                  alt={artifact.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `${process.env.NODE_ENV === 'production' ? '/algorithm_vis' : ''}/images/placeholder.png`;
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{artifact.name}</h3>
                <p className="text-gray-600 mb-4">{artifact.description}</p>
                <Link
                  to={`/${artifact.id}`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                  アーティファクトを見る
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Claude アーティファクト ギャラリー</p>
          <p className="mt-2 text-gray-400">
            すべてのアーティファクトは Anthropic 社の Claude AI を使用して生成されました。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ArtifactList;
