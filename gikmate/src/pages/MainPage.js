import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/LoginPage.css';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

function MainPage() {
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  if (!context) {
    console.error('AuthContext is undefined in MainPage');
    return <div>AuthContext가 제공되지 않았습니다.</div>;
  }
  const { isLoggedIn, user } = context;

  return (
    <div className="main-page">
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h1>메인 페이지</h1>
          <p>환영합니다! 아래 정보를 확인하세요.</p>
          <div className="form-container">
            {isLoggedIn && user && (
              <div className="input-field" style={{ margin: '15px 0', textAlign: 'left', padding: '12px' }}>
                이메일: {user.email}
              </div>
            )}
            {isLoggedIn && user && (
              <div className="input-field" style={{ margin: '15px 0', textAlign: 'left', padding: '12px' }}>
                이름: {user.name}
              </div>
            )}
            {!isLoggedIn && <p>로그인 정보가 없습니다. 다시 로그인해주세요.</p>}
            <button
              className="login-button"
              onClick={() => navigate('/dorm-search')}
              style={{ marginTop: '20px' }}
            >
              기숙사 검색으로 이동
            </button>
          </div>
          <div className="signup-link">
            <a href="/notices">공지사항</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;