import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


const Homepage = () => {
    const navigate = useNavigate();
    
    return (
        <Container className="mt-5">
            <h2>홈</h2>
            <Button className="mb-3 me-3" onClick={() => navigate('/buyticket')}>티켓 구매</Button>
            <Button className="mb-3 me-3" onClick={() => navigate('/inquiry')}>티켓 조회</Button>
        </Container>
    )
};

export default Homepage;