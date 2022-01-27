import { useWeb3 } from 'utils/web3'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import { useToast } from 'utils/useToast'
import Layout from 'components/Layout'
import Navbar from 'components/Navbar'
import { NextPage } from 'next'
import { useState } from 'react'
import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js'
import { LSP3UniversalProfile } from '@lukso/lsp-factory.js'
import UniversalProfile from '@lukso/universalprofile-smart-contracts/artifacts/UniversalProfile.json'
import KeyManager from '@lukso/universalprofile-smart-contracts/artifacts/LSP6KeyManager.json'
import jsonFile from '../data/LSP3MedatataSample.json'

//UPDATE UP using lukso technical guide https://docs.lukso.tech/guides/universal-profile/edit-profile

const UpdateProfileMockPage: NextPage = () => {
  const { account } = useWeb3()
  const [profileAddress, setUPAddress] = useState<string>('')
  const { addToast } = useToast()
  const { web3Info } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)

  const updateProfile = async () => {
    setIsLoading(true)
    try {
      const uploadResult = await LSP3UniversalProfile.uploadProfileData(jsonFile.LSP3Profile)
      const lsp3ProfileIPFSUrl = uploadResult.url

      // Step 3.1 - Setup erc725.js

      const schema: ERC725JSONSchema[] = [
        {
          name: 'LSP3Profile',
          key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
          keyType: 'Singleton',
          valueContent: 'JSONURL',
          valueType: 'bytes'
        }
      ]

      const erc725 = new ERC725(schema, profileAddress, web3Info.currentProvider, {
        ipfsGateway: 'https://ipfs.lukso.network/ipfs/'
      })

      // Step 3.2 - Encode the LSP3Profile data (to be written on our UP)
      const encodedData = erc725.encodeData({
        LSP3Profile: {
          hashFunction: 'keccak256(utf8)',
          // hash our LSP3 metadata JSON file
          hash: web3Info.utils.keccak256(JSON.stringify(jsonFile)),
          url: lsp3ProfileIPFSUrl
        }
      })

      // Step 4.1 - Load our EOA
      const myEOA = web3Info.eth.accounts.privateKeyToAccount(account.privateKey)

      // Step 4.2 - Create instances of our Contracts
      const myUP = new web3Info.eth.Contract(UniversalProfile.abi as any, profileAddress)

      const keyManagerAddress = await myUP.methods.owner().call()
      const myKM = new web3Info.eth.Contract(KeyManager.abi as any, keyManagerAddress)

      // Step 4.3 - Set data (updated LSP3Profile metadata) on our Universal Profile

      // encode the setData payload
      const abiPayload = await myUP.methods
        .setData([encodedData.LSP3Profile.key], [encodedData.LSP3Profile.value])
        .encodeABI()

      // execute via the KeyManager, passing the UP payload
      await myKM.methods.execute(abiPayload).send({ from: myEOA.address, gasLimit: 300_000 })

      addToast({
        title: 'Profile updated',
        description: 'Profile metadata updated with success',
        type: 'success',
        autoClose: true
      })
    } catch (error) {
      addToast({
        title: 'Profile not updated',
        description: 'An error occurred while updated the profile metadata',
        type: 'error',
        autoClose: true
      })
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout title="Update Profile with Mocked values | Lukso Starter Kit">
      <Navbar />
      <div className="min-h-screen p-4 my-12">
        <div className="max-w-sm p-6 mx-auto bg-white rounded-md shadow-xl">
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Update universal profile metadata
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

export default UpdateProfileMockPage
