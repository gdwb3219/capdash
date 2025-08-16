import { useState } from "react";
import axios from "axios";
import "../../../../styles/components/charts/StatusDashboard/IssueForm/IssueFormModal.css";

export default function IssueFormModal({
  equipmentId,
  status,
  onClose,
  additionalInfo,
}) {
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("설비");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/issues/", {
        equipment_id: equipmentId,
        status,
        reason,
        category,
        additional_info: additionalInfo, // 추가 정보도 함께 저장
        created_by: "user123", // 실제는 로그인 유저 ID 가져오기
      });
      alert("이슈가 저장되었습니다!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("저장 실패");
    }
  };

  // 상태에 따른 색상 클래스 결정
  const getStatusClass = () => {
    switch (status) {
      case "error":
      case "stop":
      case "red":
        return "status-red";
      case "warning":
      case "yellow":
        return "status-yellow";
      case "running":
      case "green":
        return "status-green";
      default:
        return "status-red";
    }
  };

  // 퍼센트 포맷팅 함수
  const formatPercent = (value) => {
    if (value == null) return "-";
    return (value * 100).toFixed(2) + "%";
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-container'>
        <div className='modal-header'>
          <h2 className='modal-title'>
            이슈 사유 입력
            <div className={`status-indicator ${getStatusClass()}`}></div>
          </h2>

          {/* 장비/공정 정보 표시 */}
          {additionalInfo && (
            <div className='equipment-info'>
              <div className='info-row'>
                <span className='info-label'>Site:</span>
                <span className='info-value'>{additionalInfo.site}</span>
              </div>
              <div className='info-row'>
                <span className='info-label'>Oper:</span>
                <span className='info-value'>{additionalInfo.oper}</span>
              </div>
              <div className='info-row'>
                <span className='info-label'>Factor:</span>
                <span className='info-value'>{additionalInfo.factor}</span>
              </div>

              {/* 성과 지표 표시 */}
              <div className='performance-metrics'>
                <div className='metric'>
                  <span className='metric-label'>Target:</span>
                  <span className='metric-value'>
                    {formatPercent(additionalInfo.target)}
                  </span>
                </div>
                <div className='metric'>
                  <span className='metric-label'>Latest:</span>
                  <span className='metric-value'>
                    {formatPercent(additionalInfo.latest)}
                  </span>
                </div>
                <div className='metric'>
                  <span className='metric-label'>3M Avg:</span>
                  <span className='metric-value'>
                    {formatPercent(additionalInfo.avg3)}
                  </span>
                </div>
                <div className='metric'>
                  <span className='metric-label'>6M Avg:</span>
                  <span className='metric-value'>
                    {formatPercent(additionalInfo.avg6)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form className='modal-form' onSubmit={handleSubmit}>
          <label className='form-label'>
            <span className='label-text'>사유:</span>
            <textarea
              className='form-input form-textarea'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='발생한 이슈의 상세 사유를 입력해주세요...'
              required
            />
          </label>

          <label className='form-label'>
            <span className='label-text'>카테고리:</span>
            <select
              className='form-input form-select'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value='설비'>설비</option>
              <option value='인력'>인력</option>
              <option value='자재'>자재</option>
              <option value='기타'>기타</option>
            </select>
          </label>

          <div className='button-container'>
            <button type='button' onClick={onClose} className='btn btn-cancel'>
              취소
            </button>
            <button type='submit' className='btn btn-submit'>
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
