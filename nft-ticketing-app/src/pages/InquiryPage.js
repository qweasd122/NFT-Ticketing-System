import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../contracts/TicketingSystem.json";
import { CONTRACT_ADDRESSES } from "../utils/contractAddress";
import { Button, Container, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


const InquiryPage = () => {
  const [account, setAccount] = useState('');
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showName, setShowName] = useState('');

  const contractAddress = CONTRACT_ADDRESSES[0];

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      return signer;
    } else {
      alert('메타마스크를 설치해주세요.');
    }
  };

  const handleCancelTicket = async () => {
    try {
        const signer = await connectWallet();
        const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

        const ticketCode = prompt('취소할 티켓 코드를 입력해주세요.');
        if (!ticketCode) return;

        const tx = await contract.cancelTicket(ticketCode);
        await tx.wait();
        alert('티켓이 성공적으로 취소됐습니다.');
        loadMySeat(); // 다시 좌석 조회

        const balance = await contract.balanceOf(await signer.getAddress());
        console.log("NFT 수 : ", balance.toString());

        if(balance.gt(0)) {
            const tokenId = await contract.tokenOfOwnerByIndex(await signer.getAddress(), 0);
            console.log("NFT ID:", tokenId.toString());
        }
    } catch(err) {
        console.error('티켓 취소 실패:', err);
        alert(`티켓 취소 중 오류 발생 : ${err.reason || err.message}`);
    }
  };

  const loadMySeat = async () => {
    try {
      setLoading(true);
      const signer = await connectWallet();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

      const mySeat = await contract.getMySeat();
      const myShowName = contract.showName();
      setSeats(mySeat);
      setShowName(myShowName);
    } catch (error) {
      console.error('티켓 조회 실패:', error);
      alert('티켓 조회 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  const formatSeatNumber = (seatNumber) => {
  // seatNumber가 문자열일 경우 숫자로 변환
  const num = Number(seatNumber);

  const rowIndex = Math.floor((num - 1) / 10); // 0 ~ 9
  const colIndex = (num - 1) % 10 + 1; // 1 ~ 10

  const rowLetter = String.fromCharCode(65 + rowIndex); // 65 = 'A'

  return `${rowLetter}${colIndex}`;
  };

  useEffect(() => {
    loadMySeat();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">내 NFT 티켓 조회</h2>
      {loading && <p>조회 중…</p>}

      {!loading && seats.length === 0 && <p>보유한 티켓이 없습니다.</p>}

      {!loading &&
        
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>{showName}</Card.Title>
              <Card.Text>
                좌석: {formatSeatNumber(seats)}
              </Card.Text>
              <Button variant="danger" onClick={handleCancelTicket}>
              예매 취소
            </Button>
            </Card.Body>
          </Card>
        }

      <div className="mt-3">
        <Button onClick={loadMySeat} variant="primary">다시 조회하기</Button>
      </div>
    </Container>
  );
};

export default InquiryPage;