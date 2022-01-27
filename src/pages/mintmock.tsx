import { useWeb3 } from 'utils/web3'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import { useToast } from 'utils/useToast'
import Layout from 'components/Layout'
import Navbar from 'components/Navbar'
import { NextPage } from 'next'
import { useState } from 'react'
import LSP7Mintable from '@lukso/universalprofile-smart-contracts/artifacts/LSP7Mintable.json'

//Mint  using lukso technical guide https://docs.lukso.tech/guides/create-lsp7-digital-asset

const MintMockPage: NextPage = () => {
  const { account } = useWeb3()
  const [profileAddress, setUPAddress] = useState<string>('')
  const { addToast } = useToast()
  const { web3Info } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)

  const updateProfile = async () => {
    setIsLoading(true)
    try {
      const tokenParams = [
        'My LSP7 Token', // token name
        'LSP7', // token symbol
        account.address, // new owner
        false // isNFT (make your token divisible or not)
      ]

      // create an instance
      const myToken = new web3Info.eth.Contract(LSP7Mintable.abi as any, undefined, {
        gas: 5_000_000,
        gasPrice: '1000000000'
      })

      // deploy the token contract
      const deloyedContract = await myToken
        .deploy({ data: LSP7Mintable.bytecode, arguments: tokenParams })
        .send({ from: account.address })

      const mintedToken = await deloyedContract.methods
        .mint(profileAddress, 100, false, '0x')
        .send({ from: account.address })

      console.log(profileAddress)
      console.log(mintedToken)

      addToast({
        title: 'Token minted',
        description: 'Token deployed and minted to the universal profile',
        type: 'success',
        autoClose: true
      })
    } catch (error) {
      addToast({
        title: 'Token not minted',
        description: 'An error occurred while deploying/minting the token',
        type: 'error',
        autoClose: true
      })
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout title="Mint token with mocked values | Lukso Starter Kit">
      <Navbar />
      <div className="min-h-screen p-4 my-12">
        <div className="max-w-sm p-6 mx-auto bg-white rounded-md shadow-xl">
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Mint token to Universal profile
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Enter a contract address of a Universal Profile
              </p>
            </div>
          </div>
          <div className="my-3">
            <TextInput
              name="up_contract_address"
              placeholder="0x..."
              onChange={(e) => setUPAddress(e.currentTarget.value)}
            />
          </div>
          <div className="mt-5">
            <Button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 sm:col-start-2 sm:text-sm"
              onClick={updateProfile}
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

export default MintMockPage
