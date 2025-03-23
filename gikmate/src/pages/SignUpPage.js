import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaRegEye } from "react-icons/fa";
import '../styles/LoginPage.css';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState(''); // 상태 유지 (임시 저장용)
  const navigate = useNavigate();

  // 주소 검색 함수
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        setAddress(data.address); // 기본 주소 설정
      },
    }).open();
  };

  const handleSignUp = async () => {
    console.log('API URL:', process.env.REACT_APP_API_URL);
    try {
      const fullAddress = `${address} ${detailAddress}`.trim(); // 주소 결합
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/signup`, {
        email,
        password,
        name,
        birth,
        address: fullAddress, // 단일 필드로 전달
      });
      if (response.data.success) {
        alert('회원가입 성공! 로그인 페이지로 이동합니다.');
        navigate('/');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert('회원가입 중 오류 발생');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">Gikmate</div>
        <h1>회원가입</h1>
        <p>계정을 만들어 시작하세요</p>
        <div className="form-container">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <div className="password-container">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
            <span className="eye-icon"><FaRegEye />
            </span>
          </div>
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
          <input
            type="date"
            placeholder="생년월일"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="주소 검색"
            value={address}
            onClick={handleAddressSearch}
            readOnly
            className="input-field"
          />
          <input
            type="text"
            placeholder="상세 주소"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            className="input-field"
          />
          <button className="login-button" onClick={handleSignUp}>
            회원가입
          </button>
        </div>
        <div className="signup-link">
          이미 계정이 있으신가요? <a href="/">로그인</a>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;