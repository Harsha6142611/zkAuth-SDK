import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  VStack,
  TabList,
  Tabs,
  Tab,
  Alert,
  AlertIcon,
  Text,
  Box,
  useColorModeValue,
  useMediaQuery,
} from '@chakra-ui/react';
import { ZKAuth } from '../index.js';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const ZKAuthModal = ({ isOpen, onClose, onSuccess, apiKey }) => {
  const [mode, setMode] = useState('login');
  const [secretKey, setSecretKey] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const authUrl = 'http://localhost:3000/auth';
  const zkAuth = new ZKAuth({ apiKey, authUrl });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [isSmallScreen] = useMediaQuery('(max-width: 768px)');
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryInput, setShowRecoveryInput] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowRecoveryPhrase(false);

    if (!secretKey.trim()) {
      setError('Secret key is required');
      setLoading(false);
      return;
    }

    try {
      const challenge = await zkAuth.getChallenge();
      
      if (mode === 'register') {
        const result = await zkAuth.register(apiKey, secretKey, challenge);
        setRecoveryPhrase(result.recoveryPhrase);
        setShowRecoveryPhrase(true);
        onSuccess({ mode: 'register', ...result });
      } else if (mode === 'import') {
        const result = await zkAuth.importFromRecoveryPhrase(recoveryPhrase, secretKey);
        onSuccess({ mode: 'import', ...result });
      } else {
        await zkAuth.unlock(secretKey);
        const result = await zkAuth.login(apiKey, secretKey, challenge);
        onSuccess({ mode: 'login', ...result });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (index) => {
    const newMode = ['login', 'register', 'import'][index];
    setMode(newMode);
    setSecretKey('');
    setRecoveryPhrase('');
    setError('');
    setShowRecoveryPhrase(false);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay 
        bg="blackAlpha.600"
        backdropFilter="blur(8px)"
      />
      <ModalContent 
        bg={bgColor} 
        borderRadius="32px"
        boxShadow="2xl"
        w={isSmallScreen ? '90%' : '500px'}
        maxW="500px"
        minH="500px"
        mx="auto"
        overflow="hidden"
        p={0}
        mt="10vh"
      >
        <Box
          bg="blue.500"
          color="black"
          textAlign="center"
          py={4}
          fontWeight="bold"
          fontSize="30px"
          borderTopRadius="32px"
          mt={10}
        >
          {mode === 'login' && 'Login'}
          {mode === 'register' && 'Register'}
          {mode === 'import' && 'Import'}
        </Box>
        <ModalHeader pt={10} pb={6} textAlign="center">
          <Tabs 
            isFitted 
            variant="soft-rounded" 
            onChange={handleTabChange}
            defaultIndex={['login', 'register', 'import'].indexOf(mode)}
            w="full"
            mt={20}
          >
            <TabList 
              px={30} 
              gap={30}
              w="full"
              display="grid"
              gridTemplateColumns="repeat(3, 1fr)"
              height="30px"
            >
              <Tab 
                _selected={{ 
                  color: 'black', 
                  bg: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: 'md'
                }}
                borderRadius="full"
                fontWeight="semibold"
                transition="all 0.2s"
                py={3}
              >
                Login
              </Tab>
              <Tab 
                _selected={{ 
                  color: 'black', 
                  bg: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: 'md'
                }}
                borderRadius="full"
                fontWeight="semibold"
                transition="all 0.2s"
                py={3}
              >
                Register
              </Tab>
              <Tab 
                _selected={{ 
                  color: 'black', 
                  bg: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: 'md'
                }}
                borderRadius="full"
                fontWeight="semibold"
                transition="all 0.2s"
                py={3}
              >
                Import
              </Tab>
            </TabList>
          </Tabs>
        </ModalHeader>

        <ModalBody 
          py={8} 
          px={8}
          borderTop="1px solid"
          borderColor={borderColor}
        >
          <form onSubmit={handleAuth}>
            <VStack spacing={6} align="stretch">
              {mode === 'import' && (
                <Box position="relative" w="70%" mx="auto">
                  <Input
                    type={showRecoveryInput ? "text" : "password"}
                    placeholder="Enter Recovery Phrase"
                    value={recoveryPhrase}
                    onChange={(e) => setRecoveryPhrase(e.target.value)}
                    size="lg"
                    height="50px"
                    w="70%"
                    mx="auto"
                    fontSize="md"
                    mt={30}
                    mb={-20}
                    borderRadius="10px"
                    borderWidth="2px"
                    _focus={{
                      borderColor: 'blue.400',
                      boxShadow: '0 0 0 1px blue.400'
                    }}
                    _hover={{
                      borderColor: 'gray.300'
                    }}
                    px={6}
                  />
                  <Button
                    position="absolute"
                    right="2"
                    top="50%"
                    mt={20}
                    transform="translateY(-50%)"
                    variant="ghost"
                    onClick={() => setShowRecoveryInput(!showRecoveryInput)}
                    size="sm"
                  >
                    {showRecoveryInput ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </Box>
              )}

              <Box position="relative" w="70%" mx="auto">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === 'import' ? 'New Password' : 'Secret Key'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  size="lg"
                  height="50px"
                  w="70%"
                  mx="auto"
                  fontSize="md"
                  mt={30}
                  mb={10}
                  borderRadius="10px"
                  borderWidth="2px"
                  _focus={{
                    borderColor: 'blue.400',
                    boxShadow: '0 0 0 1px blue.400'
                  }}
                  _hover={{
                    borderColor: 'gray.300'
                  }}
                  px={6}
                />
                <Button
                  position="absolute"
                  right="2"
                  top="50%"
                  mt={10}
                  transform="translateY(-50%)"
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  size="sm"
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </Box>

              {error && (
                <Alert status="error" borderRadius="full">
                  <AlertIcon />
                  <Text fontSize="sm">{error}</Text>
                </Alert>
              )}

              {showRecoveryPhrase && (
                <Box
                  p={6}
                  bg="gray.50"
                  borderRadius="2xl"
                  borderWidth={2}
                  borderColor={borderColor}
                >
                  <Text fontWeight="semibold" mb={3}>
                    Recovery Phrase (Save this securely):
                  </Text>
                  <Text 
                    fontSize="md" 
                    p={4}
                    bg="white"
                    borderRadius="xl"
                    wordBreak="break-all"
                  >
                    {recoveryPhrase}
                  </Text>
                </Box>
              )}

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                height="56px"
                isLoading={loading}
                loadingText="Processing..."
                borderRadius="full"
                w="30%"
                mx="auto"
                fontSize="md"
                fontWeight="semibold"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                  bg: 'white',
                  color: 'black',
                  borderWidth: '2px',
                  borderColor: 'blue.500'
                }}
              >
                {mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Import'}
              </Button>
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter 
          p={8}
          borderTop="1px solid"
          borderColor={borderColor}
          mt="auto"
          mb={20}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Button
            onClick={onClose}
            size="lg"
            height="50px"
            width="full"
            borderRadius="full"
            colorScheme="gray"
            variant="outline"
            fontSize="md"
            fontWeight="semibold"
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: 'md',
              bg: 'white',
              color: 'black',
              borderWidth: '2px'
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ZKAuthModal;