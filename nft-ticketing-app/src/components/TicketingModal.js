import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../contracts/TicketingSystem.json";
import { CONTRACT_ADDRESSES } from "../utils/contractAddress";
import { Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


const TicketingModal = ({ show, onHide, showInfo }) => {
  const [wallet, setWallet] = useState("");
  const [inputString, setInputString] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [takenSeats, setTakenSeats] = useState([]);
//   const [ rawSeats, setRawSeats ] = useState([]);


  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWallet(address);
    } else {
      alert("MetaMask를 설치해주세요.");
    }
  };

  const fetchTakenSeats = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESSES[0], contractABI.abi, provider);
      const seats = await contract.getTakenSeats();
    //   if(!Array.isArray(seats)) { setRawSeats([seats]); }
      const seatsToNumber = seats.map(seat => Number(seat));
      setTakenSeats(seatsToNumber);
    } catch (err) {
      console.error("좌석 상태 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    if (show) {
      fetchTakenSeats();
    }
  }, [show]);

  const buyTicket = async () => {
    if (!selectedSeat || !inputString) return alert("좌석과 문자열을 입력해 주세요.");
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESSES[0], contractABI.abi, signer);
      const ticketPrice = await contract.ticketPrice();

      const tx = await contract.buyTicket(selectedSeat, inputString, {
        value: ticketPrice
      });
      const receipt = await tx.wait();
      setStatus(`✅ 티켓 구매 성공! 트랜잭션: ${receipt.transactionHash}`);
      fetchTakenSeats();

      const balance = await contract.balanceOf(await signer.getAddress());
      console.log("NFT 수 : ", balance.toString());

      if(balance.gt(0)) {
        const tokenId = await contract.tokenOfOwnerByIndex(await signer.getAddress(), 0);
        console.log("NFT ID:", tokenId.toString());
      }
    } catch (err) {
      console.error("⛔ 에러 발생:", err);
      setStatus(`❌ 실패: ${err.reason || err.message}`);
    }
    setLoading(false);
  };

  const renderSeats = () => {
  const rows = [
    { rowLabel: 'A', start: 1, end: 10 },
    { rowLabel: 'B', start: 11, end: 20 },
    { rowLabel: 'C', start: 21, end: 30 },
    { rowLabel: 'D', start: 31, end: 40 },
    { rowLabel: 'E', start: 41, end: 50 },
    { rowLabel: '', separator: true }, // 여백용 행
    { rowLabel: 'F', start: 51, end: 60 },
    { rowLabel: 'G', start: 61, end: 70 },
    { rowLabel: 'H', start: 71, end: 80 },
    { rowLabel: 'I', start: 81, end: 90 },
    { rowLabel: 'J', start: 91, end: 100 },
  ];


  return (
    <div>
      {rows.map((row, idx) => {
        if (row.separator) {
          return <div key={`sep-${idx}`} style={{ height: '16px' }} />;
        }

        const seatNumbers = Array.from({ length: 10 }, (_, i) => row.start + i);
        return (
          <div key={row.rowLabel} className="d-flex gap-2 mb-2">
            {seatNumbers.map((seat) => {
              const isTaken = takenSeats.includes(seat);
              const isSelected = selectedSeat === seat;

              return (
                <Button
                  key={seat}
                  variant={
                    isTaken
                      ? "secondary"
                      : isSelected
                      ? "success"
                      : "outline-secondary"
                  }
                  onClick={() => !isTaken && setSelectedSeat(seat)}
                  disabled={isTaken}
                  style={{ width: '60px' }}
                >
                  {row.rowLabel}{seat % 10 === 0 ? 10 : seat % 10}
                </Button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>티켓 구매</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!wallet ? (
          <Button onClick={connectWallet}>메타마스크 지갑 연결</Button>
        ) : (
          <>
            <p>계정 : {wallet}</p>
            <div className="mb-3">{renderSeats()}</div>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="랜덤 문자열 입력"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
            />
          </>
        )}
        {status && <p className="mt-2 text-muted">{status}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>닫기</Button>
        <Button variant="primary" onClick={buyTicket} disabled={loading || !wallet || !selectedSeat}>
          {loading ? "구매 중..." : "티켓 구매"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TicketingModal;