const issuedAssetId='FiNvZ2yHF1j7nxGcNugfahhdXHMupRA7DNXi4h2YKNUg';
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
                    {type:"integer", value: 100},
                    {type:"integer", value: 1000000},
                ]},
            payment: [
                {amount: 10000000, assetId: issuedAssetId }
            ]});
        await broadcast(ttx)
        await waitForTx(ttx.id);
    });

    it('Bid', async ()=>{
        const ttx = invokeScript({dappAddress: address(env.accounts[1]), call:{function:"bid",args:[
                    {type:"integer", value: 3},
                    {type:"integer", value: 1000000},
                ]},
            payment: []});
        await broadcast(ttx)
        await waitForTx(ttx.id);
    });
})
