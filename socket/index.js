
import http from "http";
import {Server} from 'socket.io';
import { ethers } from "ethers";
import NftBazzar from "../../Context/NFTBazzar.json" assert { type: 'json' };
// import {NFTBazzarAddress} from "../../Context/constants.js"
import {app} from "../app.js"
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config({path: './config/.env',});


// try {
//   const NftBazzar = await import("../../Context/NFTBazzar.json", { assert: { type: 'json' } });
//   console.log(NftBazzar);
// } catch (error) {
//   console.error("Error importing JSON:", error);
// }
const NFTBazzarAddress = "0xD215F6bBA6356f4d51fd258ff9D516D6638D429f";
const server = http.createServer(app);

const io = new Server(server, { 
    cors: { 
        origin: '*',
        credentials: true,
     }
});


// Connect to Ethereum provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(NFTBazzarAddress, NftBazzar.abi, wallet);
const contracttt = new ethers.Contract(NFTBazzarAddress, NftBazzar.abi, wallet);

io.on('connection', (socket) => {
  console.log('a user connected');
  // contract.removeAllListeners('idMarketItemCreated');
  //   contract.removeAllListeners('BuyItem');
  //   contract.removeAllListeners('NewBid');
  //   contract.removeAllListeners('AuctionEnded');

  // Listen for NFT create
  contract.on('idMarketItemCreated', async (tokenId, seller, owner, creator, contract, pricee, sold, onAuction, onSale, auctionEndTime, highestBidd, highestBidder) => {
      const tokenURI = await contracttt.tokenURI(tokenId);
      console.log(`TokenURI for ${tokenId}:`, tokenURI);
      const { data: metadata } = await axios.get(tokenURI);
      console.log(`Metadata for ${tokenId}:`, metadata);
      const highestBid = ethers.formatUnits(highestBidd.toString(), "ether");
      const price = ethers.formatUnits(pricee.toString(), "ether");
      const nftData = {
        price,
        tokenId: tokenId.toString(),
        seller: seller,
        owner: owner,
        creator: creator,
        image: metadata.image,
        name: metadata.name,
        description: metadata.description,
        catagory: metadata.catagory,
        sold: sold,
        tokenURI,
        onAuction: onAuction,
        onSale: onSale,
        auctionEndTime: auctionEndTime.toString(),
        highestBid,
        highestBidder: highestBidder,
      }
    io.emit('idmarketItemCreated', nftData);
  });
    
  // Listen for bought NFT  
  contract.on('BuyItem', async (tokenId, buyer) => {
    console.log(`NFT ${tokenId} bought: buyer ${buyer.toString()}`);

    io.emit('buyItem', { tokenId: tokenId.toString(),buyer });
  }); 

  // Listen for bid on
  contract.on('NewBid', async (tokenId, highestBidder, highestBid) => {
    console.log(`Auction ${tokenId} new Bid: Bidder ${highestBidder.toString()}, bid ${highestBid.toString()}`);
    io.emit('newBid', { tokenId: tokenId.toString(), highestBid: ethers.formatUnits(highestBid.toString(), "ether"), highestBidder });
  }); 

  // Listen for auction ending
  contract.on('AuctionEnded', async (tokenId, highestBid, highestBidder) => {
    console.log(`Auction ${tokenId} ended: highest bidder ${highestBidder.toString()}, highest bid ${highestBid.toString()}`);
    io.emit('auctionEnded', { tokenId: tokenId.toString(), highestBid: ethers.formatUnits(highestBid.toString(), "ether"), highestBidder });
  });

  // Listen for resell NFT
  contract.on('ResellItem', async (tokenId, price, onAuction, auctionEndTime, highestBidder ) => {
    console.log(`NFT ${tokenId} resell:, price ${price.toString()}`);
    io.emit('resellItem', { tokenId: tokenId.toString(), price:ethers.formatUnits(price.toString(), "ether"), onAuction, auctionEndTime: auctionEndTime.toString(), highestBidder });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    contract.removeAllListeners('idMarketItemCreated');
    contract.removeAllListeners('BuyItem');
    contract.removeAllListeners('NewBid');
    contract.removeAllListeners('AuctionEnded');
    contract.removeAllListeners('ResellItem');
  });
});


  // Backend automation to end auctions automatically at the right time
  const endAuctionsAutomatically = async () => {
    try {
      console.log("End auction Automatically function running...");
      
      const auctions = await contract.fetchAuctionItem();
      
      console.log("auctions",auctions);
      
      if(auctions.length === 0) {
        console.log("no auctions")
        return;
      }

      for (const auction of auctions) {
        try {
          console.log("auction in loop", auction.auctionEndTime);
      
          const currentTime = Math.floor(Date.now() / 1000);
          console.log("currentTime", currentTime);
      
          if (currentTime >= auction.auctionEndTime && auction.onAuction) {
            console.log("In the if statement", currentTime);
      
            const tx = await contract.endAuction(auction._tokenId);
            await tx.wait();
            console.log("tx", tx);
            console.log(`Auction ${auction._tokenId} ended automatically`);
          }

          console.log("for loop ended");
          
        } catch (error) {
          console.error(`Error ending auction ${auction._tokenId}:`, error);
        }
      }
      
  
      // for (let i = 0; i <= 1; i++) {
      //   const auction = auctions[i];
      //   // console.log("auction in loop",Number(auction[0]));
      //   console.log("auction in loop",auction.auctionEndTime);
        
      //   const currentTime = Math.floor(Date.now() / 1000);
      //   console.log("cutrre", currentTime);
        
  
      //   if (currentTime >= auction.auctionEndTime && auction.onAuction) {
      //     console.log("in the if statement",currentTime);
          
      //     const tx = await contract.endAuction(auction._tokenId);
          
      //     await tx.wait();
      //     console.log("tx",tx);
      //     console.log(`Auction ${i} ended automatically`);
      //   }
      // }
    } catch (error) {
      console.error('Error ending auction automatically:', error);
    }
  }; 
  
  // Run backend automation every 60 seconds to check if auctions need to be ended
  setInterval(endAuctionsAutomatically, 6000000);



  export {app,server}