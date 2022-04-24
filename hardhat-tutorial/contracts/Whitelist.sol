//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist {
    // Max no of whitelisted addresses allowed.
    uint8 public maxWhitelistedAddresses;

    // Whitelisted addresses = True while non whitelisted addies = False
    mapping(address => bool) public whitelistedAddresses;

    // Keep track of whitelisted addies
    uint8 public numAddressesWhitelisted;

    // Set max num of whitelisted addies.
    constructor(uint8 _maxWhitelistedAddresses){
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    // addAddressToWhitelist - this func adds the address of the contract sender.
    function addAddressToWhitelist() public {
        // Check if user has been whitelisted
        require(!whitelistedAddresses[msg.sender], "Sender is in the whitelist.");
        // Check if num of whitelisted addies < max num of whitelisted addies,
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "Sorry, whitelist has reached its limit.");
        // Add the addy that called function to the whitelistedAddresses array
        whitelistedAddresses[msg.sender] = true;
        // Increase the num of whitelisted addies
        numAddressesWhitelisted += 1;    
    }
}