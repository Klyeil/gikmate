import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-token`, { token });
          if (response.data.success) {
            setIsLoggedIn(true);
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setUser(null);
            navigate('/'); // 유효하지 않은 토큰이면 로그인 페이지로 리다이렉트
          }
        } catch (error) {
          console.error('토큰 검증 실패:', error);
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setUser(null);
          navigate('/');
        }
      }
      setLoading(false); // 검증 완료 후 로딩 상태 해제
    };
    verifyToken();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  if (loading) {
    return <div>로딩 중...</div>; // 로딩 중 UI 표시
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setIsLoggedIn, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;