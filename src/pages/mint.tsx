import { useWeb3 } from 'utils/web3'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import { useToast } from 'utils/useToast'
import Layout from 'components/Layout'
import Navbar from 'components/Navbar'
import { NextPage } from 'next'
import { LSPFactory } from '@lukso/lsp-factory.js';
import { fetchAllERC725Data } from 'utils/lukso/profile'
import { useState } from 'react'
import { tokenIdAsBytes32 } from "../utils/tokens";
import { createContractsInstance } from '../utils/lukso/profile'

import LSP8IdentifiableDigitalAsset from '@lukso/universalprofile-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json';
import LSP8Mintable from '@lukso/universalprofile-smart-contracts/artifacts/LSP8Mintable.json';
import LSP7Mintable from '@lukso/universalprofile-smart-contracts/artifacts/LSP7Mintable.json';



const MintPage: NextPage = () => {
  const { account, balance } = useWeb3()
  const [ownerUPAddress, setUPFromAddress] = useState<string>('')
  const [recipientUPAddress, setUPToAddress] = useState<string>('')
  const { addToast } = useToast()
  const { web3Info } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)

  

  const mintAssetLSP8 = async () => {
    setIsLoading(true)
    try {
      const metamaskAccountAddress = "0xbA125C184Ce41238a6EE88A3080d388Eb87501Fd";

      console.log(recipientUPAddress);
      const universalProfileData = await fetchAllERC725Data(recipientUPAddress)
      console.log(universalProfileData);

      const tokenParams = [
        'FFNFT', // token name
        'FFF', // token symbol
        metamaskAccountAddress, // new owner
      ];

      const tokenInstance = new web3Info.eth.Contract(LSP8Mintable.abi as any, undefined, {
        gas: 5_000_000,
        gasPrice: '1000000000',
      });

      console.log("Contract Instance created")

      const deployedContract = await tokenInstance
      .deploy({ data: LSP8Mintable.bytecode, arguments: tokenParams })
      .send({ from: metamaskAccountAddress});

      console.log("Contract deployed")
      console.log(deployedContract)

      const ownerBalanceBeforeMint = await deployedContract.methods.balanceOf(ownerUPAddress).call();
      const recipientBalanceBeforeTransfer = await deployedContract.methods.balanceOf(recipientUPAddress).call();

      console.log("Owner balance before mint:", ownerBalanceBeforeMint)
      console.log("Recipient balance before mint:", recipientBalanceBeforeTransfer)

      const mintedToken = await deployedContract.methods
      .mint(ownerUPAddress, tokenIdAsBytes32(10), true, "0x")
      .send({ from: metamaskAccountAddress});

      console.log("Token Minted")
      console.log(mintedToken);

      const totalSupply = await deployedContract.methods.totalSupply().call()
      const ownerBalanceAfterMint = await deployedContract.methods.balanceOf(ownerUPAddress).call();
      const recipientBalanceAfterMint = await deployedContract.methods.balanceOf(recipientUPAddress).call();

      console.log("Total supply of tokens:", totalSupply)

      console.log("Owner Balance after mint:", ownerBalanceAfterMint)
      console.log("Recipient Balance after mint:", recipientBalanceAfterMint)

      const tokenPayload = deployedContract.methods
      .transfer(ownerUPAddress, recipientUPAddress, tokenIdAsBytes32(10), false, '0x')
      .encodeABI();

      const { profileContract, keyManagerContract } = await createContractsInstance(
        ownerUPAddress,
        web3Info
      )

      const upPayload = profileContract.methods
      .execute(0, deployedContract["_address"], 0, tokenPayload)
      .encodeABI();

      await keyManagerContract.methods.execute(upPayload).send({
        from: metamaskAccountAddress,
        gas: 5_000_000,
        gasPrice: '1000000000',
      });

      console.log("Token Transferred")
      console.log(mintedToken);
     
      const ownerBalanceAfterTransfer = await deployedContract.methods.balanceOf(ownerUPAddress).call();
      const recipientBalanceAfterTransfer = await deployedContract.methods.balanceOf(recipientUPAddress).call();

      console.log("Owner balance after transfer:", ownerBalanceAfterTransfer)
      console.log("Recipient balance after transfer:", recipientBalanceAfterTransfer)

      addToast({
        title: 'Asset deployed',
        description: 'A new asset was created and associated with your UP',
        type: 'success',
        autoClose: true
      })
    } catch (error) {
      addToast({
        title: 'Could not create a new Asset',
        description: 'Failed while minting/transfering asset',
        type: 'error',
        autoClose: true
      })
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const mintAssetLSP7 = async () => {
    setIsLoading(true)
    try {
      const metamaskAccountAddress = "0xbA125C184Ce41238a6EE88A3080d388Eb87501Fd";

      console.log(recipientUPAddress);
      const universalProfileData = await fetchAllERC725Data(recipientUPAddress)
      console.log(universalProfileData);

      const tokenParams = [
        'FFNFT', // token name
        'FF', // token symbol
        metamaskAccountAddress, // new owner
        true
      ];

      const tokenInstance = new web3Info.eth.Contract(LSP7Mintable.abi as any, undefined, {
        gas: 5_000_000,
        gasPrice: '1000000000',
      });

      console.log("Contract Instance created")

      const deployedContract = await tokenInstance
      .deploy({ data: LSP7Mintable.bytecode, arguments: tokenParams })
      .send({ from: metamaskAccountAddress});

      console.log("Contract deployed")
      console.log(deployedContract)


      const mintedToken = await deployedContract.methods
      .mint(metamaskAccountAddress, 1, true, "0x")
      .send({ from: metamaskAccountAddress});

      console.log("Token Minted")
      console.log(mintedToken);


      const totalSupply = await deployedContract.methods.totalSupply().call()
      const balance = await deployedContract.methods.balanceOf(metamaskAccountAddress).call();

      console.log("Total supply:", totalSupply)
      console.log("Balance:", balance)


      await deployedContract.methods
      .transfer(metamaskAccountAddress, recipientUPAddress, 1, true, "0x")
      .send({ from: metamaskAccountAddress});
      
      console.log("Token Transferred")
      console.log(mintedToken);

      addToast({
        title: 'Asset deployed',
        description: 'A new asset was created and associated with your UP',
        type: 'success',
        autoClose: true
      })
    } catch (error) {
      addToast({
        title: 'Could not create a new Asset',
        description: 'Failed while minting/transfering asset',
        type: 'error',
        autoClose: true
      })
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const mintAssetFactoryLSP8 = async () => {
    setIsLoading(true)
    try {
      const metamaskAccountAddress = "0xbA125C184Ce41238a6EE88A3080d388Eb87501Fd";
      
      const lspFactory = new LSPFactory('https://rpc.l14.lukso.network', {
        deployKey: account.privateKey,
        chainId: 22
      })

      console.log("Lsp factory created")
      console.log(lspFactory)

      const myDigitalAsset = await lspFactory.DigitalAsset.deployLSP8IdentifiableDigitalAsset({
        name: "LSPNFT",
        symbol: "LXYNFT",
        ownerAddress: metamaskAccountAddress, // Account which will own the Token Contract
      })

      console.log("LSP8 Digital Asset deployed")
      console.log(myDigitalAsset)

      const myNFT = new web3Info.eth.Contract(
        LSP8IdentifiableDigitalAsset.abi as any,
        myDigitalAsset.LSP8IdentifiableDigitalAsset.address,
        {
        gas: 5_000_000,
        gasPrice: '1000000000',
        }
      );

      console.log("LSP8 Digital Asset contract instance created")
      console.log(myNFT)

      const totalSupply = await myNFT.methods.totalSupply().call();

      console.log(totalSupply)

      const mintedNFT = await myNFT.methods.mint(recipientUPAddress, tokenIdAsBytes32(1), false, "0x")
      .send({ from: metamaskAccountAddress});

      console.log("LSP8 Digital Asset minted")
      console.log(mintedNFT)

      addToast({
        title: 'Asset deployed',
        description: 'A new asset was created and associated with your UP',
        type: 'success',
        autoClose: true
      })
    } catch (error) {
      addToast({
        title: 'Could not create a new Asset',
        description: 'Failed while minting/transfering asset',
        type: 'error',
        autoClose: true
      })
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Layout title="Fetch Profile | Lukso Starter Kit">
      <Navbar />
      <div className="min-h-screen p-4 my-12">
        <div className="max-w-sm p-6 mx-auto bg-white rounded-md shadow-xl">
        <div className="mt-3 text-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
             Mint token using LSP8
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Enter a contract address of a Universal Profile
              </p>
            </div>
          </div>
          <div className="my-3">
            <label htmlFor="name" className="block text-sm font-medium leading-5 text-gray-700">
                From
            </label>
            <TextInput
              name="up_from_contract_address"
              placeholder="0x..."
              onChange={(e) => setUPFromAddress(e.currentTarget.value)}
            />
          </div>
          <div className="my-3">
            <label htmlFor="name" className="block text-sm font-medium leading-5 text-gray-700">
                To
            </label>
            <TextInput
              name="up_to_contract_address"
              placeholder="0x..."
              onChange={(e) => setUPToAddress(e.currentTarget.value)}
            />
          </div>
          <div className="mt-5">
            <Button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 sm:col-start-2 sm:text-sm"
              onClick={mintAssetLSP8}
              isLoading={isLoading}
            >
              Deploy Asset
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MintPage
