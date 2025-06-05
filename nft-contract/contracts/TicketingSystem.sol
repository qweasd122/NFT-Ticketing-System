// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTTicketing.sol";

contract TicketingSystem is NFTTicketing {
    address public owner;
    uint public ticketPrice;
    //100000000000000000 테스트
    uint public totalTickets;
    uint public ticketsSold;
    uint public saleEndTime;
    string public showName;

    mapping(address => uint) public ticketsOwned;
    mapping(address => uint) public seatNumber;
    mapping(uint => bool) public isSeatTaken;

    event TicketPurchased(address indexed buyer, uint seat);
    event TicketCancelled(address indexed buyer, uint seat);

    constructor(uint _price, uint _totalTickets, uint _durationMinutes, string memory _name) {
        owner = msg.sender;
        ticketPrice = _price;
        totalTickets = _totalTickets;
        saleEndTime = block.timestamp + (_durationMinutes * 1 minutes);
        showName = _name;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, unicode"관리자만 실행할 수 있습니다.");
        _;
    }

    modifier saleActive() {
        require(block.timestamp <= saleEndTime, unicode"판매가 종료되었습니다.");
        _;
    }

    function buyTicket(uint _seat, string memory userInputString) public payable saleActive {
        require(ticketsOwned[msg.sender] == 0, unicode"이미 티켓을 구매하셨습니다.");
        require(_seat >= 1 && _seat <= totalTickets, unicode"유효하지 않은 좌석 번호입니다.");
        require(!isSeatTaken[_seat], unicode"이미 선택된 좌석입니다.");
        require(msg.value == ticketPrice, unicode"지불 금액이 맞지 않습니다.");

        getNFTTicket(userInputString);
        ticketsOwned[msg.sender] = 1;
        seatNumber[msg.sender] = _seat;
        isSeatTaken[_seat] = true;
        ticketsSold += 1;

        emit TicketPurchased(msg.sender, _seat);
    }

    function cancelTicket(string memory ticketCode) public {
        require(ticketsOwned[msg.sender] == 1, unicode"보유한 티켓이 없습니다.");

        uint seat = seatNumber[msg.sender];

        burnTicket(ticketCode);
        ticketsOwned[msg.sender] = 0;
        delete seatNumber[msg.sender];
        isSeatTaken[seat] = false;
        ticketsSold -= 1;

        payable(msg.sender).transfer(ticketPrice);

        emit TicketCancelled(msg.sender, seat);
    }

    function getMySeat() public view returns (uint) {
        return seatNumber[msg.sender];
    }

    function getUserSeat(address user) public view returns (uint) {
        return seatNumber[user];
    }

    function getTakenSeats() public view returns (uint[] memory) {
        uint[] memory result = new uint[](ticketsSold);
        uint index = 0;
        for (uint i = 1; i <= totalTickets; i++) {
            if (isSeatTaken[i]) {
                result[index] = i;
                index++;
            }
        }
        return result;
    }

    function getAvailableSeats() public view returns (uint[] memory) {
        uint availableCount = totalTickets - ticketsSold;
        uint[] memory result = new uint[](availableCount);
        uint index = 0;
        for (uint i = 1; i <= totalTickets; i++) {
            if (!isSeatTaken[i]) {
                result[index] = i;
                index++;
            }
        }
        return result;
    }

    function withdraw() public onlyOwner {
        require(address(this).balance > 0, unicode"인출할 잔액이 없습니다.");
        payable(owner).transfer(address(this).balance);
    }
}
