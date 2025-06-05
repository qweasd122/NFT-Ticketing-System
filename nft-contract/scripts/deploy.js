const hre = require("hardhat");

async function main() {
  const TicketingSystem = await hre.ethers.getContractFactory("TicketingSystem");
  const ticketPrice = ethers.utils.parseEther("100");
  const contract = await TicketingSystem.deploy(ticketPrice, 100, 43200, "테스트1");


  console.log("typeof contract:", typeof contract);
  console.log("contract keys:", Object.keys(contract));

  await contract.deployed();
  console.log("✅ Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
