export const RPC_URL = 'https://rpc.l14.lukso.network'
export const CHAIN_ID = 22
export const IPFS_URL = 'https://ipfs.lukso.network/ipfs/'

// keccak256('AddressPermissions[]')
export const PERMISSIONS_ARRAY =
  '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3'

export const ADDRESSES = {
  PERMISSIONS: '0x4b80742d0000000082ac0000', // AddressPermissions:Permissions:<address> --> bytes32
  ALLOWED_ADDRESSES: '0x4b80742d00000000c6dd0000', // AddressPermissions:AllowedAddresses:<address> --> address[]
  ALLOWED_FUNCTIONS: '0x4b80742d000000008efe0000' // AddressPermissions:AllowedFunctions:<address> --> bytes4[]
}

export const PERMISSIONS = {
  CHANGE_OWNER: '0x0000000000000000000000000000000000000000000000000000000000000001', // 0000 0000 0000 0001
  CHANGE_PERMISSIONS: '0x0000000000000000000000000000000000000000000000000000000000000002', // .... .... .... 0010
  ADD_PERMISSIONS: '0x0000000000000000000000000000000000000000000000000000000000000004', // .... .... .... 0100
  SET_DATA: '0x0000000000000000000000000000000000000000000000000000000000000008', // .... .... .... 1000
  CALL: '0x0000000000000000000000000000000000000000000000000000000000000010', // .... .... 0001 ....
  STATIC_CALL: '0x0000000000000000000000000000000000000000000000000000000000000020', // .... .... 0010 ....
  DELEGATE_CALL: '0x0000000000000000000000000000000000000000000000000000000000000040', // .... .... 0100 ....
  DEPLOY: '0x0000000000000000000000000000000000000000000000000000000000000080', // .... .... 1000 ....
  TRANSFER_VALUE: '0x0000000000000000000000000000000000000000000000000000000000000100', // .... 0001 .... ....
  SIGN: '0x0000000000000000000000000000000000000000000000000000000000000200' // .... 0010 .... ....
}