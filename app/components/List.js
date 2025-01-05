import { ethers } from "ethers";

function List({ toggleCreate, fee, provider, poppad }) {
  async function listHandler(form) {
    try {
      const name = form.get("name");
      const ticker = form.get("ticker");

      // Input validation
      if (!name || !ticker) {
        throw new Error("Name and ticker are required");
      }

      // Get signer
      const signer = await provider.getSigner();
      
      // Verify fee is being passed correctly
      console.log("Fee being passed:", fee.toString());
      
      // Create transaction with explicit gas limit
      const transaction = await poppad.connect(signer).create(
        name, 
        ticker, 
        { 
          value: fee,
          gasLimit: 500000 // Explicit gas limit
        }
      );

      // Wait for transaction
      const receipt = await transaction.wait();
      console.log("Transaction successful:", receipt);

      toggleCreate();
    } catch (error) {
      console.error("Detailed error:", error);
      
      // More user-friendly error message
      if (error.code === 'CALL_EXCEPTION') {
        alert("Transaction failed. Please check if:\n" +
              "- You have enough ETH to pay the fee\n" +
              "- The name and ticker are valid\n" +
              "- Your wallet is connected to the correct network");
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  }

  return (
    <div className="list">
      <h2>list new token</h2>

      <div className="list__description">
        <p>fee: {ethers.formatUnits(fee, 18)} ETH</p>
      </div>

      <form action={listHandler}>
        <input 
          type="text" 
          name="name" 
          placeholder="name" 
          required 
          minLength="1"
        />
        <input 
          type="text" 
          name="ticker" 
          placeholder="ticker" 
          required 
          minLength="1"
        />
        <input type="submit" value="[ list ]" />
      </form>

      <button onClick={toggleCreate} className="btn--fancy">[ cancel ]</button>
    </div>
  );
}

export default List;