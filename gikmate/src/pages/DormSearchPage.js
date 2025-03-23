import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';
import { AuthContext } from '../context/AuthContext';

function DormSearchPage() {
  const [dorms, setDorms] = useState([]);
  const [filteredDorms, setFilteredDorms] = useState([]);
  const [selectedDorm, setSelectedDorm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const email = location.state?.email || user?.email;

  // 기숙사 목록 가져오기
  useEffect(() => {
    const fetchDorms = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dorm/dorms`);
        setDorms(response.data);
        setFilteredDorms(response.data); // 초기값 설정
      } catch (error) {
        console.error('기숙사 목록 가져오기 실패:', error);
        alert('기숙사 목록을 가져오는 데 실패했습니다.');
      }
    };
    fetchDorms();
  }, []);

  // 지역 필터링
  useEffect(() => {
    if (selectedRegion) {
      setFilteredDorms(dorms.filter(dorm => dorm.region === selectedRegion));
    } else {
      setFilteredDorms(dorms);
    }
  }, [selectedRegion, dorms]);

  // 인증 상태 확인
  useEffect(() => {
    const checkCertification = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.data.user.isDormCertified) {
          navigate('/dorm-community', { state: { email: response.data.user.email, role: response.data.user.role } });
        } else if (response.data.user.applicationStatus === 'pending') {
          setApplicationStatus('pending');
        }
      } catch (error) {
        console.error('인증 상태 확인 실패:', error);
        alert('인증 상태를 확인하는 데 실패했습니다.');
      }
    };
    checkCertification();
  }, [navigate]);

  // 거주 인증 신청 처리
  const handleApplyDorm = async () => {
    if (!selectedDorm) {
      alert('기숙사를 선택해주세요.');
      return;
    }
    setIsApplying(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/dorm/apply-dorm`, {
        email,
        dorm: selectedDorm,
      });
      if (response.data.success) {
        setApplicationStatus('pending');
        alert('기숙사 인증 신청이 완료되었습니다. 운영자의 승인을 기다려주세요.');
      } else {
        alert('기숙사 인증 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('기숙사 인증 신청 실패:', error);
      alert('기숙사 인증 신청 중 오류가 발생했습니다.');
    } finally {
      setIsApplying(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    logout();
  };

  // 지역 목록 추출
  const regions = [...new Set(dorms.map(dorm => dorm.region))];

  // 인증 신청 대기 중 UI
  if (applicationStatus === 'pending') {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo">Gikmate</div>
          <h1>기숙사 인증 대기 중</h1>
          <p>운영자의 승인을 기다리고 있습니다. 승인이 완료되면 기숙사 커뮤니티로 이동합니다.</p>
          <div className="signup-link">
            <a href="/main">홈으로 돌아가기</a>
            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">Gikmate</div>
        <h1>기숙사 검색 및 거주 인증</h1>
        <p>거주 중인 기숙사를 선택하세요</p>
        <div className="form-container">
          <div className="filter">
            <label>지역 필터: </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="input-field"
            >
              <option value="">전체</option>
              {regions.map((region, index) => (
                <option key={index} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <select
            value={selectedDorm}
            onChange={(e) => setSelectedDorm(e.target.value)}
            className="input-field"
            disabled={isApplying}
          >
            <option value="">기숙사를 선택하세요</option>
            {filteredDorms.map((dorm) => (
              <option key={dorm._id} value={dorm.name}>
                {dorm.name} ({dorm.region})
              </option>
            ))}
          </select>
          <button
            className="login-button"
            onClick={handleApplyDorm}
            disabled={isApplying}
          >
            {isApplying ? '신청 중...' : '거주 인증 신청'}
          </button>
        </div>
        <div className="signup-link">
          <a href="/main">홈으로 돌아가기</a>
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}

export default DormSearchPage;