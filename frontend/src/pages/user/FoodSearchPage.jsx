import React, { useState, useEffect } from 'react';
import { resolvePath, useLocation, useNavigate } from 'react-router-dom';
import '../../Styles/user/RecipeRecommendPage.css';
import KakaoMap from '../../components/ui/KakaoMap';

export default function FoodSearchPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const missingFromRecipe =
            location.state?.missingIngredients || [];

    const [query, setQuery] = useState(
            missingFromRecipe.length > 0
                ? missingFromRecipe.join(' ') : '');
    const [loading, setLoading] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [fridgeItems, setFridgeItems] = useState([]);

    const [showMap, setShowMap] = useState(false);
    const [mapMarkets, setMapMarkets] = useState([]);
    const [mapLoading, setMapLoading] = useState(false);

    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fridgeRes = await fetch(
                        '/user/fridge/items', {
                    headers: getAuthHeaders()
                });
                const fridgeJson = await fridgeRes.json();
                if (fridgeRes.ok) {
                    setFridgeItems(fridgeJson.data || []);
                }
            } catch (err) {
                console.error('데이터 로드 실패:', err);
            }
        };
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setRecipes([]);
        setSelectedRecipe(null);
        setErrorMsg('');

        try {
            const response = await fetch('/recipe/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query.trim() })
            });

            const resData = await response.json();

            if (response.ok && resData.recipes?.length > 0) {
                // 냉장고 재료와 비교해서 missing_ingredients 보정
                const myIngredientNames =
                        fridgeItems.map(i => i.name);

                const enriched = resData.recipes.map(recipe => {
                    const recalcMissing =
                            recipe.ingredients.filter(ing =>
                                !myIngredientNames.some(
                                    fridge =>
                                        fridge.includes(ing) ||
                                        ing.includes(fridge)
                                )
                            );
                    return {
                        ...recipe,
                        missing_ingredients: recalcMissing
                    };
                });

                setRecipes(enriched);
            } else {
                setErrorMsg('검색 결과가 없습니다.');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('서버 연결 실패');
        } finally {
            setLoading(false);
        }
    };

    const saveRecipe = async (recipe) => {
        try {
            const res = await fetch('/user/recipebook', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: recipe.title,
                    description: recipe.description,
                    ingredients: recipe.ingredients
                })
            });
            if (res.ok) {
                alert('레시피북에 저장되었습니다! 📖');
            } else {
                const json = await res.json();
                alert(json.message || '이미 저장된 레시피입니다.');
            }
        } catch {
            alert('저장 중 오류가 발생했어요.');
        }
    };

    return (
        <div className="rrp-page">
            <div className="rrp-header">
                <button
                    className="rrp-header-back"
                    onClick={() => navigate(-1)}
                >←</button>
                <span className="rrp-header-title">
                    {selectedRecipe ? '레시피 상세' : '메뉴 검색'}
                </span>
            </div>

            <div className="rrp-body">

                {/* 부족한 재료 안내 */}
                {missingFromRecipe.length > 0 && (
                    <div style={{
                        background: '#fff3e0',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        fontSize: '0.85rem',
                        color: '#FF6B35'
                    }}>
                        ⚠️ 부족한 재료: {missingFromRecipe.join(', ')}
                    </div>
                )}

                {/* 검색창 */}
                {!selectedRecipe && (
                    <div style={{
                        background: 'rgba(0,0,0,0.02)',
                        border: '1.5px solid rgba(0,0,0,0.08)',
                        borderRadius: '16px',
                        padding: '16px 18px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1.5px solid rgba(0,0,0,0.12)',
                                    outline: 'none'
                                }}
                                type="text"
                                placeholder="먹고 싶은 메뉴를 입력하세요"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e =>
                                    e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                className="ai-btn"
                                onClick={handleSearch}
                                disabled={loading}
                                style={{
                                    background: '#FF6B35',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '0 20px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >검색</button>
                        </div>
                    </div>
                )}

                {/* 로딩 */}
                {loading && (
                    <div className="rrp-loading">
                        <div className="rrp-loading-spinner" />
                        <p>AI가 레시피를 검색 중입니다...</p>
                    </div>
                )}

                {/* 에러 */}
                {!loading && errorMsg && (
                    <div style={{
                        textAlign: 'center', padding: '40px 20px'
                    }}>
                        <div style={{
                            fontSize: '3rem', marginBottom: '12px'
                        }}>🥲</div>
                        <p style={{ color: '#8a7a60' }}>{errorMsg}</p>
                    </div>
                )}

                {/* 레시피 목록 */}
                {!loading && !errorMsg && !selectedRecipe
                        && recipes.length > 0 && (
                    <div className="rrp-recipe-list">
                        {recipes.map((r, idx) => (
                            <div
                                key={idx}
                                className="rrp-recipe-card"
                                onClick={() => setSelectedRecipe(r)}
                            >
                                <div className="rrp-card-info">
                                    <strong className="rrp-card-name">
                                        {r.has_expiring ? '🔥 ' : '🥗 '}
                                        {r.title}
                                    </strong>
                                    <p className="rrp-card-desc">
                                        {r.description}
                                    </p>
                                    <div style={{ marginTop: '6px' }}>
                                        <div style={{
                                            height: '4px',
                                            background: '#f0ede8',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${Math.round(
                                                    r.match_score * 100)}%`,
                                                background: r.match_score >= 0.7
                                                    ? '#4CAF50' : '#FF6B35',
                                                borderRadius: '4px',
                                            }} />
                                        </div>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: '#8a7a60',
                                            margin: '3px 0 0'
                                        }}>
                                            재료 {Math.round(
                                                r.match_score * 100)}% 보유
                                        </p>
                                    </div>
                                    {r.missing_ingredients?.length > 0 && (
                                        <p style={{
                                            fontSize: '0.76rem',
                                            color: '#FF6B35',
                                            margin: '4px 0 0'
                                        }}>
                                            ⚠️ 부족: {r.missing_ingredients
                                                .join(', ')}
                                        </p>
                                    )}
                                </div>
                                <span className="rrp-card-arrow">〉</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* 레시피 상세 */}
                {!loading && selectedRecipe && (
                    <div className="rrp-detail">
                        <button
                            className="rrp-back-btn"
                            onClick={() => setSelectedRecipe(null)}
                        >
                            ← 목록으로
                        </button>

                        <h2 className="detail-title">
                            {selectedRecipe.title}
                        </h2>

                        {selectedRecipe.has_expiring && (
                            <div style={{
                                display: 'inline-block',
                                background: '#fff3e0',
                                color: '#FF6B35',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                marginBottom: '12px',
                            }}>
                                🔥 유통기한 임박 재료 활용 레시피
                            </div>
                        )}

                        {/* 매칭률 */}
                        <div style={{
                            background: '#f8f5f0',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '16px',
                        }}>
                            <div style={{
                                fontSize: '0.82rem',
                                color: '#8a7a60',
                                marginBottom: '6px'
                            }}>
                                냉장고 재료 매칭률
                            </div>
                            <div style={{
                                height: '8px',
                                background: '#e8e3db',
                                borderRadius: '8px',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.round(
                                        selectedRecipe.match_score * 100)}%`,
                                    background: selectedRecipe.match_score >= 0.7
                                        ? '#4CAF50' : '#FF6B35',
                                    borderRadius: '8px',
                                }} />
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: '#2a1f0e',
                                marginTop: '6px'
                            }}>
                                {Math.round(
                                    selectedRecipe.match_score * 100)}% 보유
                            </div>
                        </div>

                        {/* 설명 */}
                        <div className="detail-section">
                            <h3>💬 레시피 설명</h3>
                            <p style={{
                                color: '#5a4a32', lineHeight: 1.6
                            }}>
                                {selectedRecipe.description}
                            </p>
                        </div>

                        {/* 필요 재료 */}
                        <div className="detail-section">
                            <h3>📋 필요 재료</h3>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
                                {selectedRecipe.ingredients?.map((ing, i) => {
                                    const isMissing =
                                            selectedRecipe.missing_ingredients
                                                ?.some(missing =>
                                                    missing === ing ||
                                                    missing.includes(ing) ||
                                                    ing.includes(missing));
                                    return (
                                        <span key={i} style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.82rem',
                                            fontWeight: 600,
                                            background: isMissing
                                                ? '#fff3e0' : '#e8f5e9',
                                            color: isMissing
                                                ? '#FF6B35' : '#4CAF50',
                                            border: `1px solid ${
                                                isMissing
                                                    ? '#FF6B35' : '#4CAF50'}`,
                                        }}>
                                            {isMissing ? '❌ ' : '✅ '}{ing}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 부족한 재료 */}
                        {selectedRecipe.missing_ingredients?.length > 0 && (
                            <div className="detail-section">
                                <h3>🛒 부족한 재료</h3>
                                <p className="missing-alert" style={{ color: '#5a4a32', lineHeight: 1.6 }}>
                                    ⚠️ {selectedRecipe.missing_ingredients
                                        .join(', ')}
                                </p>
                                <button
                                    onClick={async()=>{
                                        setMapLoading(true);
                                        setShowMap(true);

                                        const getLocation = () => new Promise((resolve)=>{
                                            navigator.geolocation.getCurrentPosition(
                                                pos => resolve({
                                                    latitude: pos.coords.latitude,
                                                    longitude: pos.coords.longitude
                                                }),
                                                ()=>resolve({latitude: 37.5665, longitude:126.9780})
                                            );
                                        });

                                        const location = await getLocation();

                                        try{
                                            const res = await fetch('/market/missing-items',{
                                                method: 'POST',
                                                headers: getAuthHeaders(),
                                                body: JSON.stringify({
                                                    missingIngredients: selectedRecipe.missing_ingredients,
                                                    latitude: location.latitude,
                                                    longitude: location.longitude
                                                })
                                            });
                                            const json = await res.json();
                                            setMapMarkets(json.data?.markets || []);
                                        }catch(err){
                                            console.error('시장 검색 실패:',err);
                                        }finally{
                                            setMapLoading(false);
                                        }
                                        }
                                    }

                                    
                                    style={{
                                        padding: '10px 20px',
                                        background: '#fdd537',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        marginTop: '8px'
                                    }}
                                >
                                    🏪 근처 시장에서 구매하기
                                </button>
                            </div>
                        )}
                        {/* 🍳 요리법 */}
                            <div className='detail-section'>
                            <h3>🍳 요리법</h3>
                            <ol style={{ paddingLeft: '20px', color: '#5a4a32', lineHeight: 2 }}>
                                {Array.isArray(selectedRecipe.cooking_steps)
                                ? selectedRecipe.cooking_steps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                    ))
                                : <li>{selectedRecipe.cooking_steps}</li>  // 혹시 string으로 올 경우 대비
                                }
                            </ol>
                            </div>

                            {/* 소스/양념 만드는 법 (있을 경우만 표시) */}
                            {selectedRecipe.sauce_steps?.length > 0 && (
                            <div className='detail-section'>
                                <h3>🥣 소스/양념 만드는 법</h3>
                                <ol style={{ paddingLeft: '20px', color: '#5a4a32', lineHeight: 2 }}>
                                {selectedRecipe.sauce_steps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                ))}
                                </ol>
                            </div>
                            )}
                        {/* 레시피북 저장 */}
                        <div className="detail-section">
                            <button
                                onClick={() => saveRecipe(selectedRecipe)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: '#4CAF50',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    marginTop: '16px'
                                }}
                            >
                                📖 레시피북에 저장
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* 카카오맵 모달*/}
            {showMap && (
    <div style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex', flexDirection: 'column'
    }}>
        <div style={{
            background: '#fff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #eee'
            }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                    🏪 근처 시장 찾기
                </span>
                <button onClick={async()=>{
                              console.log("부족한 재료:", selectedRecipe.missing_ingredients);
                                        setMapLoading(true);
                                        setShowMap(true);
                                        console.log("showMap:",true)

                                        const getLocation = () => new Promise((resolve)=>{
                                            navigator.geolocation.getCurrentPosition(
                                                pos => resolve({
                                                    latitude: pos.coords.latitude,
                                                    longitude: pos.coords.longitude
                                                }),
                                                ()=>resolve({latitude: 37.5665, longitude:126.9780})
                                            );
                                        });

                                        const location = await getLocation();

                                        try{
                                            const res = await fetch('/market/missing-items',{
                                                method: 'POST',
                                                headers: getAuthHeaders(),
                                                body: JSON.stringify({
                                                    missingIngredients: selectedRecipe.missing_ingredients,
                                                    latitude: location.latitude,
                                                    longitude: location.longitude
                                                })
                                            });
                                            const json = await res.json();
                                            setMapMarkets(json.data?.markets || []);
                                            
                                            setMapMarkets(json.data?.markets || []);
                                        }catch(err){
                                            console.error('시장 검색 실패:',err);
                                        }finally{
                                            setMapLoading(false);
                                        }
                                        }
                                    }
                            style={{
                                padding: '10px 20px',
                              background: '#fdd537',
                              color: '#2a1f0e',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                marginTop: '8px'
                            }}>
                    ✕
                </button>
            </div>

            {mapLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>시장을 검색 중입니다...</p>
                </div>
            ) : (
                <>
                    <KakaoMap markets={mapMarkets} />
                    <div style={{
                        overflowY: 'auto',
                        padding: '16px',
                        flex: 1
                    }}>
                        {mapMarkets.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#888' }}>
                                근처 시장에 해당 재료가 없어요
                            </p>
                        ) : (
                            mapMarkets.map((market, idx) => (
                                <div key={idx} style={{
                                    background: '#f8f5f0',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    marginBottom: '10px'
                                }}>
                                    <strong>🏪 {market.marketName}</strong>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '6px',
                                        marginTop: '8px'
                                    }}>
                                        {market.items?.map((item, i) => (
                                            <span key={i} style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                background: item.onSale
                                                    ? '#fff3e0' : '#e8f5e9',
                                                color: item.onSale
                                                    ? '#FF6B35' : '#4CAF50',
                                                border: `1px solid ${
                                                    item.onSale
                                                        ? '#FF6B35' : '#4CAF50'}`
                                            }}>
                                                {item.onSale ? '🔴 ' : ''}
                                                {item.name} {item.onSale
                                                    ? `${item.discountPrice?.toLocaleString()}원`
                                                    : `${item.originalPrice?.toLocaleString()}원`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    </div>
)}
        </div>
    );
}