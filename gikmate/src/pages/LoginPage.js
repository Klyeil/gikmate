import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';
import { AuthContext } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn, user, setIsLoggedIn, setUser } = useContext(AuthContext);

  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.isDormCertified) {
        navigate('/dorm-community', { state: { email: user.email, name: user.name } });
      } else {
        navigate('/dorm-search', { state: { email: user.email, name: user.name } });
      }
    }
  }, [isLoggedIn, user, navigate]);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password,
      });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        setUser(response.data.user); // 사용자 정보 업데이트
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert('로그인 중 오류 발생');
    }
  };

  if (isLoggedIn && user) {
    return null;
  }

  return (
    <div className="main-page">
      <div className="login-container">
        <div className="login-box">
          <div className="logo">Gikmate</div>
          <h1>로그인</h1>
          <p>이메일과 비밀번호를 입력하세요</p>
          <div className="form-container">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
            <button className="login-button" onClick={handleLogin}>
              로그인
            </button>
          </div>
          <div className="signup-link">
            계정이 없으신가요? <a href="/signup">회원가입</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;