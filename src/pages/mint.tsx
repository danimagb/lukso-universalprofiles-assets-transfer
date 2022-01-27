import { useWeb3 } from 'utils/web3'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import { useToast } from 'utils/useToast'
import Layout from 'components/Layout'
import Navbar from 'components/Navbar'
import { NextPage } from 'next'
import { useState } from 'react'
import { tokenIdAsBytes32 } from '../utils/tokens'
import { createContractsInstance } from '../utils/lukso/profile'
import { hasPermission } from 'utils/lukso'
import LSP8Mintable from '@lukso/universalprofile-smart-contracts/artifacts/LSP8Mintable.json'

const MintPage: NextPage = () => {
  const { account } = useWeb3()
  const [ownerUPAddress, setUPFromAddress] = useState<string>('')
  const [recipientUPAddress, setUPToAddress] = useState<string>('')
  const [tokenName, setTokenName] = useState<string>('')
  const [tokenSymbol, setTokenSymbol] = useState<string>('')
  const { addToast } = useToast()
  const { web3Info } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)

  const mintAssetLSP8 = async () => {
    setIsLoading(true)
    try {
      const hasPermissions = await hasPermission(ownerUPAddress, account.address, web3Info)

      if (!hasPermissions) {
        addToast({
          title: 'No permissions to control the profile',
          description:
            'The current account does not have permissions to control the profile set in "From" field',
          type: 'warning',
          autoClose: true
        })
      }

      const tokenParams = [
        tokenName, // token name
        tokenSymbol, // token symbol
        account.address // new owner
      ]

      // Step 1 - Created an instance of the LSP8 contract
      const tokenInstance = new web3Info.eth.Contract(LSP8Mintable.abi as any, undefined, {
        gas: 5_000_000,
        gasPrice: '1000000000'
      })

      console.log('Contract Instance created')

      // Step 2 - Deploy the token contract
      const deployedContract = await tokenInstance
        .deploy({ data: LSP8Mintable.bytecode, arguments: tokenParams })
        .send({ from: account.address })

      console.log('Contract deployed')
      console.log(deployedContract)

      const ownerBalanceBeforeMint = await deployedContract.methods.balanceOf(ownerUPAddress).call()
      const recipientBalanceBeforeTransfer = await deployedContract.methods
        .balanceOf(recipientUPAddress)
        .call()

      console.log('Owner balance before mint:', ownerBalanceBeforeMint)
      console.log('Recipient balance before mint:', recipientBalanceBeforeTransfer)

      // Step 3 - Mint one token to the ownerUpAddress
      const mintedToken = await deployedContract.methods
        .mint(ownerUPAddress, tokenIdAsBytes32(10), true, '0x')
        .send({ from: account.address })

      console.log('Token Minted')
      console.log(mintedToken)

      const totalSupply = await deployedContract.methods.totalSupply().call()
      const ownerBalanceAfterMint = await deployedContract.methods.balanceOf(ownerUPAddress).call()
      const recipientBalanceAfterMint = await deployedContract.methods
        .balanceOf(recipientUPAddress)
        .call()

      console.log('Total supply of tokens:', totalSupply)

      console.log('Owner Balance after mint:', ownerBalanceAfterMint)
      console.log('Recipient Balance after mint:', recipientBalanceAfterMint)

      // Step 4 - Execute the transfer from ownerUPAddress to recipientUPAddress using the keymanager
      const { profileContract, keyManagerContract } = await createContractsInstance(
        ownerUPAddress,
        web3Info
      )

      const tokenPayload = deployedContract.methods
        .transfer(ownerUPAddress, recipientUPAddress, tokenIdAsBytes32(10), false, '0x')
        .encodeABI()

      const upPayload = profileContract.methods
        .execute(0, deployedContract['_address'], 0, tokenPayload)
        .encodeABI()

      await keyManagerContract.methods.execute(upPayload).send({
        from: account.address,
        gas: 5_000_000,
        gasPrice: '1000000000'
      })

      console.log('Token Transferred')
      console.log(mintedToken)

      const ownerBalanceAfterTransfer = await deployedContract.methods
        .balanceOf(ownerUPAddress)
        .call()
      const recipientBalanceAfterTransfer = await deployedContract.methods
        .balanceOf(recipientUPAddress)
        .call()

      console.log('Owner balance after transfer:', ownerBalanceAfterTransfer)
      console.log('Recipient balance after transfer:', recipientBalanceAfterTransfer)

      addToast({
        title: 'Asset created and transferred',
        description: 'A new asset was created and transferred to the given Universal profile',
        type: 'success',
        autoClose: true
      })
    } catch (error) {
      addToast({
        title: 'Could not create/tranfer asset',
        description: 'An error occurred while creating, minting or transfering asset',
        type: 'error',
        autoClose: true
      })
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout title="Mint/transfer token | Lukso Starter Kit">
      <Navbar />
      <div className="min-h-screen p-4 my-12">
        <div className="max-w-sm p-6 mx-auto bg-white rounded-md shadow-xl">
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Issue, Mint and transfer token using LSP8
            </h3>
          </div>
          <div className="my-3">
            <label htmlFor="name" className="block text-sm font-medium leading-5 text-gray-700">
              Token Name
            </label>
            <TextInput
              name="token_name"
              placeholder="MY Sweet NFT"
              onChange={(e) => setTokenName(e.currentTarget.value)}
            />
          </div>
          <div className="my-3">
            <label htmlFor="name" className="block text-sm font-medium leading-5 text-gray-700">
              Token symbol
            </label>
            <TextInput
              name="token_symbol"
              placeholder="NFT"
              onChange={(e) => setTokenSymbol(e.currentTarget.value)}
            />
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
              Execute
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MintPage
