import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';
import './RatingModal.css'; 

const RatingModal = ({ show, handleClose, orderId, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (!show) {
            setRating(0);
            setHover(0);
            setComment("");
        }
    }, [show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Vui lòng chọn số sao để đánh giá!");
            return;
        }
        
        onSubmit({
            orderId,
            rating,
            comment
        });
        
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>⭐ Đánh giá đơn hàng #{orderId}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="d-block text-center fw-bold">Chất lượng sản phẩm/dịch vụ:</Form.Label>
                        <div className="star-rating-container text-center">
                            {[...Array(5)].map((_, index) => {
                                const ratingValue = index + 1;
                                return (
                                    <label key={index}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            value={ratingValue}
                                            onClick={() => setRating(ratingValue)}
                                            style={{ display: 'none' }}
                                        />
                                        <FaStar
                                            className="star"
                                            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                            size={40}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(0)}
                                            style={{ cursor: 'pointer', transition: 'color 200ms' }}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                        <p className="text-center mt-2 text-muted">Bạn đã chọn: **{rating} sao**</p>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="ratingComment">
                        <Form.Label className='fw-bold'>Bình luận của bạn (Tùy chọn):</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Chia sẻ nhận xét của bạn về đơn hàng..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </Form.Group>
                    
                    <div className="d-grid gap-2 mt-4">
                        <Button 
                            variant="warning" 
                            type="submit" 
                            disabled={rating === 0}
                        >
                            Gửi đánh giá
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default RatingModal;