import React, { useState } from "react";
import axios from "axios";
import * as Form from "@radix-ui/react-form";
import { Button, Card, Flex, Heading, TextField, Select } from '@radix-ui/themes';
import { API_BASE_URL } from '../../utils/constants';


const Register: React.FC = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      console.log("Form data being sent:", form);
      await axios.post(API_BASE_URL + "/auth/register", form); // Cambia la URL si es necesario
      setSuccess("Registro exitoso");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Error al registrar");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <Flex align="center" justify="center" style={{ height: '100vh' }}>
      <Card size="3" style={{ minWidth: 350 }}>
        <Form.Root onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <Heading size="4" align="center">Registrese en Biblios</Heading>
            <Form.Field name="username">
              <Form.Label>Usuario</Form.Label>
              <Form.Control asChild>
                <TextField.Root
                  type="text"
                  placeholder="Nombre de usuario"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </Form.Control>
            </Form.Field>
            <Form.Field name="fullName">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control asChild>
                <TextField.Root
                  type="text"
                  placeholder="Nombre completo"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </Form.Control>
            </Form.Field>
            <Form.Field name="email">
              <Form.Label>Email</Form.Label>
              <Form.Control asChild>
                <TextField.Root
                  type="email"
                  placeholder="Correo electrónico"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </Form.Control>
            </Form.Field>
            <Form.Field name="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control asChild>
                <TextField.Root
                  type="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </Form.Control>
            </Form.Field>
            <Form.Field name="role">
              <Flex direction="column" gap="2">
                <Form.Label>Rol</Form.Label>
                <Form.Control asChild>
                  <Select.Root defaultValue="user" onValueChange={(value) => setForm({ ...form, role: value })}>
                    <Select.Trigger placeholder="Selecionar Rol" />
                    <Select.Content>
                        <Select.Item value="admin">Administrador</Select.Item>
                        <Select.Item value="user">Usuario</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Form.Control>
              </Flex>
            </Form.Field>
            <Button type="submit" size="3" color="blue">Registrarse</Button>
            {error && <div style={{ color: "red" }}>{error}</div>}
            {success && <div style={{ color: "green" }}>{success}</div>}
          </Flex>
        </Form.Root>
      </Card>
    </Flex>
  );
};

export default Register;