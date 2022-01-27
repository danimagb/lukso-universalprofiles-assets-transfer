import { useWeb3 } from 'utils/web3'
import Button from 'components/Button'
import { useToast } from 'utils/useToast'
import Layout from 'components/Layout'
import Navbar from 'components/Navbar'
import { NextPage } from 'next'
import { LSPFactory } from '@lukso/lsp-factory.js'
import { useState } from 'react'

//Create UP using lukso technical guide https://docs.lukso.tech/guides/universal-profile/create-profile

const CreateProfileMockPage: NextPage = () => {
  const { account } = useWeb3()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const createProfile = async () => {
    setIsLoading(true)
    try {
      // Step 3.2 - Setup the lsp-factory
      const lspFactory = new LSPFactory(
        // L14 chain RPC endpoint
        'https://rpc.l14.lukso.network',
        {
          // L14s chain Id
          chainId: 22,
          // We use our EOA's private key, to specify the EOA address that:
          //   1) will deploy the UP
          //   2) will be the UP owner
          deployKey: account.privateKey // or myEOA.privateKey
        }
      )

      const deployedContracts = await lspFactory.LSP3UniversalProfile.deploy({
        controllingAccounts: [account.address], // our EOA will be controlling our UP
        lsp3Profile: {
          name: 'My Universal Profile',
          description: 'My Cool Universal Profile',
          tags: ['Public Profile'],
          links: [
            {
              title: 'My Website',
              url: 'http://my-website.com'
            }
          ]
        }
      })

      console.log(deployedContracts)
      const myUPAddress = deployedContracts?.ERC725Account?.address
      console.log('my Universal Profile address: ', myUPAddress)

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
    <Layout title="Create Profile with mocked values | Lukso Starter Kit">
      <Navbar />
      <div className="min-h-screen p-4 my-12">
        <div className="max-w-sm p-6 mx-auto bg-white rounded-md shadow-xl">
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Creates a Profile</h3>
          </div>

          <div className="mt-5">
            <Button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 sm:col-start-2 sm:text-sm"
              onClick={createProfile}
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

export default CreateProfileMockPage
