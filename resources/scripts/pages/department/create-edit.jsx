import {
    Form,
    Input,
    PageHeader,
    Card,
    Col,
    Row,
    Button,
    Space,
    message,
    Spin,
    Table,
    List,
    Popconfirm,
    Modal,
} from "antd";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useDepartmentActions, useRoleActions } from "@/_actions";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import RoleModal from "./create-edit-role";
import { userCan } from '@/_state';

const CreateRole = ({}) => {
    const actions = useDepartmentActions();

    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { id } = useParams();
    const isEdit = !!id;

    const [saveLoading, setSaveLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingRow, setLoadingRow] = useState(false);
    const [roles, setRoles] = useState([]);
    const [currentRole, setCurrentRole] = useState(null);

    const loadDetail = async () => {
        setLoading(true);
        const { data } = await actions.show(id);
        const roleBuild = [];
        const getRoleItem = async (item, level) => {
            roleBuild.push(item);
            if (item.childs || item.children_recursive) {
                (item.childs || item.children_recursive).map((child) =>
                    getRoleItem(child, level + 1)
                );
            }
        };
        data.roles.map((role) => getRoleItem(role, 0));
        setRoles(roleBuild);
        form.setFieldsValue({
            name: data.name,
        });
        setLoading(false);
    };

    useEffect(() => {
        if (id) {
            loadDetail();
        }
    }, []);

    const onSave = async () => {
        try {
            const values = form.getFieldsValue();
            setSaveLoading(true);
            if (isEdit) {
                await actions.update(id, {
                    ...values,
                });
            } else {
                await actions.create({
                    ...values,
                });
                setCaps([]);
                form.resetFields();
            }
            setSaveLoading(false);

            message.success(
                isEdit
                    ? "C???p nh???t ph??ng ban th??nh c??ng"
                    : "Th??m m???i ph??ng ban th??nh c??ng"
            );
        } catch (error) {
            console.error(error);
            // message.error(error.response.data.message);
        }
    };

    const canCreateRole = useRecoilValue(userCan("role.create"));
    const canDeleteRole = useRecoilValue(userCan("role.delete"));
    const canEditRole = useRecoilValue(userCan("role.update"));

    return (
        <div>
            <PageHeader
                title={isEdit ? "C???p nh???t ph??ng ban" : "Th??m m???i ph??ng ban"}
                onBack={() => navigate("/department")}
            />

            <Form
                form={form}
                onFinish={onSave}
                name="form"
                labelCol={{
                    span: 6,
                }}
            >
                <Row gutter={15}>
                    <Col span={18}>
                        <Card title="Th??ng tin">
                            {loading ? (
                                <Spin />
                            ) : (
                                <>
                                    <Form.Item
                                        name="name"
                                        label="T??n ph??ng ban"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Vui l??ng nh???p t??n ph??ng ban",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </>
                            )}
                        </Card>
                        <Card className="mt-3" title="Danh s??ch ch???c v???">
                            <Table
                                dataSource={roles}
                                columns={[
                                    {
                                        title: "T??n ch???c v???",
                                        dataIndex: "name",
                                        sorter: true,
                                    },
                                    {
                                        title: "H??nh ?????ng",
                                        width: 150,
                                        render: (_, record) => (
                                            <div className="text-center">
                                                {loadingRow == record.id ? (
                                                    <Spin />
                                                ) : (
                                                    <Space size="middle">
                                                        {canCreateRole && (
                                                            <a
                                                                className="text-blue-400"
                                                                onClick={() =>
                                                                    setCurrentRole(
                                                                        record
                                                                    )
                                                                }
                                                            >
                                                                C???p nh???t
                                                            </a>
                                                        )}
                                                        {canDeleteRole && (
                                                            <Popconfirm
                                                                title="B???n ch???c ch???n ch????"
                                                                onConfirm={() =>
                                                                    removeRole(
                                                                        record.id
                                                                    )
                                                                }
                                                            >
                                                                <a className="text-red-500">
                                                                    Xo??
                                                                </a>
                                                            </Popconfirm>
                                                        )}
                                                    </Space>
                                                )}
                                            </div>
                                        ),
                                    },
                                ]}
                                loading={loading}
                            ></Table>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="H??nh ?????ng">
                            {saveLoading ? (
                                <Spin />
                            ) : (
                                <Space>
                                    <Button
                                        disabled={loading}
                                        type="primary"
                                        className="bg-slate-600 text-white"
                                        htmlType="submit"
                                    >
                                        L??u l???i
                                    </Button>
                                    <Button
                                        type="default"
                                        className="bg-red-500 text-white"
                                        onClick={() => navigate("/department")}
                                    >
                                        Hu??? b???
                                    </Button>
                                </Space>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Form>
            {currentRole && (
                <RoleModal
                    onRequestClose={() => setCurrentRole(null)}
                    show
                    model={currentRole}
                />
            )}
        </div>
    );
};
export default CreateRole;
