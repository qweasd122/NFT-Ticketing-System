import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import TicketingModal from '../components/TicketingModal';


const BuyTicketPage = () => {
  const [selectedShow, setSelectedShow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const shows = [
    { id: 1, title: '테스트1', date: '2025-06-10', location: '테스트1', showId: 101 },
    { id: 2, title: '테스트2', date: '2025-06-15', location: '테스트2', showId: 102 },
    { id: 3, title: '테스트3', date: '2025-06-20', location: '테스트3', showId: 103 },
  ];

  const handleShowClick = (show) => {
    setSelectedShow(show);
    setModalOpen(true);
  };

  return (
    <Container className="mt-4">
        <Button className="mb-3 me-3" onClick={() => navigate('/')}>홈</Button>
      <h2 className="mb-4">공연 목록</h2>
      <Row>
        {shows.map((show) => (
          <Col md={4} key={show.id}>
            <Card className="mb-3" onClick={() => handleShowClick(show)} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <Card.Title>{show.title}</Card.Title>
                <Card.Text>
                  날짜: {show.date}<br />
                  장소: {show.location}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedShow && (
        <TicketingModal
          show={modalOpen}
          onHide={() => setModalOpen(false)}
          showInfo={selectedShow}
        />
      )}
    </Container>
  );
};

export default BuyTicketPage;