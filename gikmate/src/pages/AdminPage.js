import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/AdminPage.css';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [dorms, setDorms] = useState([]);
  const [users, setUsers] = useState([]);
  const [newDorm, setNewDorm] = useState({ name: '', roleName: '', region: '' });
  const [filterStatus, setFilterStatus] = useState('pending');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // 관리자 권한 확인
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('관리자 권한이 필요합니다.');
      navigate('/');
    }
  }, [user, navigate]);

  // 인증 신청 목록 가져오기
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dorm/pending-applications`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setApplications(response.data);
      } catch (error) {
        console.error('신청 목록 가져오기 실패:', error);
      }
    };
    fetchApplications();
  }, []);

  // 기숙사 목록 가져오기
  useEffect(() => {
    const fetchDorms = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dorm/dorms`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setDorms(response.data);
      } catch (error) {
        console.error('기숙사 목록 가져오기 실패:', error);
      }
    };
    fetchDorms();
  }, []);

  // 사용자 목록 가져오기
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('사용자 목록 가져오기 실패:', error);
      }
    };
    fetchUsers();
  }, []);

  // 인증 신청 처리
  const handleApplication = async (applicationId, action) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/dorm/assign-role`, {
        applicationId,
        action,
      });
      if (response.data.success) {
        alert(`신청이 ${action === 'approve' ? '승인' : '거절'}되었습니다.`);
        setApplications(applications.filter(app => app.id !== applicationId));
      }
    } catch (error) {
      console.error('신청 처리 실패:', error);
      alert('신청 처리 중 오류가 발생했습니다.');
    }
  };

  // 기숙사 추가
  const handleAddDorm = async () => {
    if (!newDorm.name || !newDorm.roleName || !newDorm.region) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/dorm/dorms`, newDorm);
      if (response.data.success) {
        setDorms([...dorms, response.data.dorm]);
        setNewDorm({ name: '', roleName: '', region: '' });
        alert('기숙사가 추가되었습니다.');
      }
    } catch (error) {
      console.error('기숙사 추가 실패:', error);
      alert('기숙사 추가 중 오류가 발생했습니다.');
    }
  };

  // 기숙사 삭제
  const handleDeleteDorm = async (dormId) => {
    if (window.confirm('이 기숙사를 삭제하시겠습니까? 관련 사용자 데이터도 초기화됩니다.')) {
      try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/dorm/dorms/${dormId}`);
        if (response.data.success) {
          setDorms(dorms.filter(dorm => dorm._id !== dormId));
          alert('기숙사가 삭제되었습니다.');
        }
      } catch (error) {
        console.error('기숙사 삭제 실패:', error);
        alert('기숙사 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 사용자 역할 변경
  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/users/${userId}/role`, { role: newRole });
      if (response.data.success) {
        setUsers(users.map(u => (u._id === userId ? { ...u, role: newRole } : u)));
        alert('사용자 역할이 변경되었습니다.');
      }
    } catch (error) {
      console.error('역할 변경 실패:', error);
      alert('역할 변경 중 오류가 발생했습니다.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="admin-container">
      <h1>관리자 페이지</h1>

      {/* 탭 네비게이션 */}
      <div className="tabs">
        <button
          className={activeTab === 'applications' ? 'active' : ''}
          onClick={() => setActiveTab('applications')}
        >
          인증 신청 관리
        </button>
        <button
          className={activeTab === 'dorms' ? 'active' : ''}
          onClick={() => setActiveTab('dorms')}
        >
          기숙사 관리
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          사용자 관리
        </button>
      </div>

      {/* 인증 신청 관리 탭 */}
      {activeTab === 'applications' && (
        <div className="tab-content">
          <h2>기숙사 인증 신청 목록</h2>
          <div className="filter">
            <label>상태 필터: </label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="pending">대기 중</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거절됨</option>
            </select>
          </div>
          {applications.length === 0 ? (
            <p>대기 중인 신청이 없습니다.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>이메일</th>
                  <th>기숙사</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>{app.email}</td>
                    <td>{app.dorm}</td>
                    <td>{app.applicationStatus || '대기 중'}</td>
                    <td>
                      <button onClick={() => handleApplication(app.id, 'approve')}>승인</button>
                      <button onClick={() => handleApplication(app.id, 'reject')}>거절</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 기숙사 관리 탭 */}
      {activeTab === 'dorms' && (
        <div className="tab-content">
          <h2>기숙사 관리</h2>
          <div className="form-container">
            <input
              type="text"
              placeholder="기숙사 이름"
              value={newDorm.name}
              onChange={(e) => setNewDorm({ ...newDorm, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="역할 이름 (예: dorm_member_A)"
              value={newDorm.roleName}
              onChange={(e) => setNewDorm({ ...newDorm, roleName: e.target.value })}
            />
            <input
              type="text"
              placeholder="지역 (예: 서울)"
              value={newDorm.region}
              onChange={(e) => setNewDorm({ ...newDorm, region: e.target.value })}
            />
            <button onClick={handleAddDorm}>기숙사 추가</button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>기숙사 이름</th>
                <th>역할 이름</th>
                <th>지역</th>
                <th>생성일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {dorms.map(dorm => (
                <tr key={dorm._id}>
                  <td>{dorm.name}</td>
                  <td>{dorm.roleName}</td>
                  <td>{dorm.region}</td>
                  <td>{new Date(dorm.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDeleteDorm(dorm._id)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 사용자 관리 탭 */}
      {activeTab === 'users' && (
        <div className="tab-content">
          <h2>사용자 관리</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>이메일</th>
                <th>이름</th>
                <th>역할</th>
                <th>기숙사</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
                  <td>{u.dorm || '없음'}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u._id, e.target.value)}
                    >
                      <option value="user">일반 사용자</option>
                      <option value="admin">관리자</option>
                      {dorms.map(dorm => (
                        <option key={dorm._id} value={dorm.roleName}>
                          {dorm.roleName}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="signup-link">
        <a href="/main">홈으로 돌아가기</a>
      </div>
    </div>
  );
}

export default AdminPage;