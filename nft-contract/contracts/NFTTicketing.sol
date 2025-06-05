// 컴파일러 버전 지정
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFTTicketing is ERC721Enumerable, ERC721URIStorage {
    constructor() ERC721("EventTicket", "ETK") {}

    // 필수 함수 오버라이드
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }


    // 본문 시작
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => string) public ticketCodes;
    mapping(address => uint256) public nftIds;



    // 티켓 발행
    function getNFTTicket(string memory ticketCode) public returns (bytes32) {
        ticketCodes[msg.sender] = ticketCode;
        return mintTicket(ticketCode);
    }


    // 랜덤 문자열 + 현재 시간 조합 후 해시 처리해 URI 생성
    function mintTicket(string memory randomString) private returns (bytes32) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        // 클릭 시점의 timestamp 사용
        uint256 timestamp = block.timestamp;

        // 고유 식별 문자열 구성
        string memory input = string(abi.encodePacked(randomString, Strings.toString(timestamp)));
        bytes32 hashedInput = keccak256(abi.encodePacked(input));

        // 해시를 URI로 저장
        string memory fakeURI = Strings.toHexString(uint256(hashedInput), 32);

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, fakeURI);

        nftIds[msg.sender] = newItemId;

        return hashedInput;
    }

    // NFT burn 
    function burnTicket(string memory ticketCode) public {
        require(nftIds[msg.sender] != 0, unicode"NFT 토큰을 소유하고 있지 않습니다.");
        require(keccak256(abi.encodePacked(ticketCode)) == keccak256(abi.encodePacked(ticketCodes[msg.sender])), unicode"티켓 코드가 맞지 않습니다.");

        _burn(nftIds[msg.sender]);

        ticketCodes[msg.sender] = "";
        nftIds[msg.sender] = 0;
    }
}