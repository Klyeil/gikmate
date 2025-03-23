import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DormCommunityPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkCertification = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.data.user.isDormCertified) {
          navigate('/dorm-search'); // 인증 안 된 경우 리다이렉트
        }
      } catch (error) {
        console.error('인증 확인 오류:', error);
        navigate('/'); // 오류 시 로그인 페이지로
      }
    };
    checkCertification();
  }, [navigate]);

  return (
    <div>
      <h1>기숙사 전용 커뮤니티</h1>
      <p>인증된 사용자만 이용할 수 있는 페이지입니다.</p>
    </div>
  );
}

export default DormCommunityPage;