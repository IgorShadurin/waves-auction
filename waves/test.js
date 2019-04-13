const issuedAssetId = 'FiNvZ2yHF1j7nxGcNugfahhdXHMupRA7DNXi4h2YKNUg';
const durationInBlocks = 5;
const testAuction = 14;
const minBid = 1000000;
const currentBid = 1000001;
describe('Auction test suite', () => {
    it('Issue tokens', async ()=>{
        const ttx = issue({
            name: 'AUCTION TOKEN',
            description: 'Awesome token that will tokenize tokenization tokenized',
            quantity: 10000000000,
            fee: 200000000
        });
        await broadcast(ttx)
        await waitForTx(ttx.id);
    });

    it('Create auction', async ()=>{
        const ttx = invokeScript({dappAddress: address(env.accounts[0]), call:{function:"createAuction",args:[
                    {type:"integer", value: durationInBlocks},
                    {type:"integer", value: minBid},
                ]},
            payment: [
                {amount: 10000000, assetId: issuedAssetId }
            ]});
        await broadcast(ttx)
        await waitForTx(ttx.id);
    });

    it('Bid', async ()=>{
        const ttx = invokeScript({
            dappAddress: address(env.accounts[0]), call:{function:"bid",args:[
                    {type:"integer", value: testAuction},
                    {type:"integer", value: currentBid},
                ]},
            payment: []
        });
        await broadcast(ttx)
        await waitForTx(ttx.id);
    });

    it('Receive tokens after win', async ()=>{
        const ttx = invokeScript({
            dappAddress: address(env.accounts[0]), call:{function:"payAndReceive",args:[
                    {type:"integer", value: testAuction},
                ]},
            payment: [
                {amount: currentBid, assetId: null }
            ]
        });
        await broadcast(ttx)
        await waitForTx(ttx.id);
    });

    it('Cancel auction', async ()=>{
        const ttx = invokeScript({
            dappAddress: address(env.accounts[0]), call:{function:"cancel",args:[
                    {type:"integer", value: testAuction},
                ]},
            payment: []
        });
        await broadcast(ttx)
        await waitForTx(ttx.id);
    });
})
