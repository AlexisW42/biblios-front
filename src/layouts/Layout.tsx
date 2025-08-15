// src/components/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Box, Flex, Button, Text, Avatar, Separator } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog'; // Keep this if Dialog is used elsewhere
import { useNavigate } from 'react-router-dom';
import { HamburgerMenuIcon, Cross1Icon, DashboardIcon, PersonIcon, LockClosedIcon, ReaderIcon, FileTextIcon, GlobeIcon, ExitIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import authStore  from '../stores/authStore';

interface SidebarProps {
  onClose?: () => void; // Prop para cerrar el sidebar en móvil
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {

    const { logout } = authStore(); // Get logout from the store
    const user = authStore((state) => state.user);
    const navigate = useNavigate(); // Get navigate hook
    const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Flex direction="column" py="4" px="3" style={{ height: '100%' }}>
      {onClose && (
        <Flex justify="end" mb="4">
          <Dialog.Close asChild>
            <Button variant="ghost" color="gray" onClick={onClose}>
              <Cross1Icon />
            </Button>
          </Dialog.Close>
        </Flex>
      )}

      {/* Sección de perfil de usuario */}
      <Flex direction="column" align="center" mb="5" gap="2">
        <Avatar
          src="/path/to/profile-image.jpg" // Reemplaza con la ruta real de la imagen
          fallback="P"
          size="6"
          radius="full"
        />
        <Text weight="bold" size="3">{user?.full_name}</Text>
        <Text size="2" color="gray">Administrador</Text>
      </Flex>

      <Separator size="4" my="3" />

      {/* Links de navegación */}
      <Flex direction="column" gap="2" flexGrow="1">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose} end>
          <Flex align="center" gap="2">
            <DashboardIcon />
            <Text>Escritorio</Text>
          </Flex>
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Flex align="center" gap="2">
            <PersonIcon />
            <Text>Usuarios</Text>
          </Flex>
        </NavLink>
        {/* <NavLink to="/roles" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Flex align="center" gap="2">
            <LockClosedIcon />
            <Text>Roles</Text>
          </Flex>
        </NavLink> */}
        <NavLink to="/books" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Flex align="center" gap="2">
            <ReaderIcon />
            <Text>Libros</Text>
          </Flex>
        </NavLink>
        <NavLink to="/loans" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Flex align="center" gap="2">
            <ExternalLinkIcon />
            <Text>Préstamos</Text>
          </Flex>
        </NavLink>
      </Flex>

      {/* Links inferiores */}
      <Flex direction="column" gap="2" mt="auto">
        <Separator size="4" my="3" />
        {/* <NavLink to="/intranet" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <GlobeIcon />
          <Text>Intranet</Text>
        </NavLink> */}
        <Button variant="ghost" color="gray" onClick={handleLogout}>
          <ExitIcon />
          <Text>Cerrar sesión</Text>
        </Button>
      </Flex>
    </Flex>
  );
};

const Header: React.FC<{ onMenuButtonClick: () => void; }> = ({ onMenuButtonClick }) => {
  return (
    <Flex
      as="div" // Changed from "header" to "div" to resolve type issue with Radix UI Flex component
      align="center"
      justify="between"
      p="3"
      style={{
        borderBottom: '1px solid var(--gray-a4)',
        backgroundColor: 'var(--color-background)',
        height: 'var(--space-8)' // Altura fija para el header
      }}
    >
      {/* Muestra el botón de hamburguesa solo en pantallas pequeñas */}
      <Box display={{ initial: 'block', md: 'none' }}>
        <Button variant="ghost" onClick={onMenuButtonClick}>
          <HamburgerMenuIcon width="20" height="20" />
        </Button>
      </Box>
      <Text size="5" weight="bold">Biblios</Text>
      <Box>{/* Puedes añadir otros elementos aquí, como un avatar de usuario o notificaciones */}</Box>
    </Flex>
  );
};

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Usamos los breakpoints de Radix UI: 'md' es 768px
      setIsMobile(window.innerWidth < 768);
    };

    // Establece el estado inicial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Flex direction="column" style={{ minHeight: '100vh' }}>
      <Header onMenuButtonClick={() => setIsSidebarOpen(true)} />

      <Flex flexGrow="1">
        {/* Sidebar para pantallas de escritorio (oculto en móvil) */}
        <Box
          width="250px"
          flexShrink="0"
          display={{ initial: 'none', md: 'block' }} // Oculta en 'initial' (móvil), muestra en 'md' (escritorio)
          style={{
            borderRight: '1px solid var(--gray-a4)',
            backgroundColor: 'var(--color-background)',
            overflowY: 'auto'
          }}
        >
          <Sidebar />
        </Box>

        {/* Sidebar para móvil (usando Radix Dialog como overlay) */}
        {isMobile && (
          <Dialog.Root open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="DialogOverlay" />
              <Dialog.Content className="DialogContent">
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}

        {/* Contenido principal */}
        <Flex
          flexGrow="1"
          p="4"
          justify="center" // Centra horizontalmente el contenido
          style={{ overflowY: 'auto', backgroundColor: 'var(--gray-1)' }}
        >
          <Box style={{ width: '100%', maxWidth: '1200px' }}> {/* O ajusta el maxWidth según tus necesidades */}
            <Outlet /> {/* Aquí se renderiza el componente de la ruta actual */}
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Layout;