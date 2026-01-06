import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import KanbanBoard from '../../src/components/KanbanBoard';
import { tasksAPI } from '../../src/api/tasks';

jest.mock('../../src/api/tasks');
jest.mock('lucide-react', () => ({
    Plus: () => <div data-testid="plus-icon">Plus</div>,
    Trash2: () => <div data-testid="trash-icon">Trash</div>,
    Edit2: () => <div data-testid="edit-icon">Edit</div>,
    X: () => <div data-testid="x-icon">X</div>,
}));

jest.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }) => <div>{children}</div>,
    DragOverlay: ({ children }) => <div>{children}</div>,
    closestCorners: jest.fn(),
    KeyboardSensor: jest.fn(),
    PointerSensor: jest.fn(),
    useSensor: jest.fn(),
    useSensors: jest.fn(() => []),
    useDroppable: jest.fn(() => ({ setNodeRef: jest.fn() })),
}));

jest.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }) => <div>{children}</div>,
    sortableKeyboardCoordinates: jest.fn(),
    verticalListSortingStrategy: jest.fn(),
    useSortable: jest.fn(() => ({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    })),
}));

describe('KanbanBoard', () => {
    const mockTasks = [
        {
            id: 1,
            title: 'Task 1',
            description: 'Description 1',
            status: 'To Do',
            assignee: { id: 1, name: 'John Doe' },
            assignee_id: 1,
        },
        {
            id: 2,
            title: 'Task 2',
            description: 'Description 2',
            status: 'In Progress',
            assignee: { id: 2, name: 'Jane Smith' },
            assignee_id: 2,
        },
        {
            id: 3,
            title: 'Task 3',
            description: null,
            status: 'Done',
            assignee: null,
            assignee_id: null,
        },
    ];

    const mockProjectMembers = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
        window.alert = jest.fn();
    });

    describe('Board Rendering', () => {
        test('renders all three columns', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
                expect(screen.getByText('In Progress')).toBeInTheDocument();
                expect(screen.getByText('Done')).toBeInTheDocument();
            });
        });

        test('fetches and displays tasks correctly', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('Task 1')).toBeInTheDocument();
                expect(screen.getByText('Task 2')).toBeInTheDocument();
                expect(screen.getByText('Task 3')).toBeInTheDocument();
            });
        });

        test('displays task descriptions when available', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('Description 1')).toBeInTheDocument();
                expect(screen.getByText('Description 2')).toBeInTheDocument();
            });
        });

        test('displays assignee information when available', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/Assigned to: John Doe/i)).toBeInTheDocument();
                expect(screen.getByText(/Assigned to: Jane Smith/i)).toBeInTheDocument();
            });
        });
    });

    describe('Read-Only Mode', () => {
        test('hides edit and delete buttons in read-only mode', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });

            render(<KanbanBoard projectId={1} isReadOnly={true} />);

            await waitFor(() => {
                expect(screen.getByText('Task 1')).toBeInTheDocument();
            });

            const editIcons = screen.queryAllByTestId('edit-icon');
            const deleteIcons = screen.queryAllByTestId('trash-icon');

            expect(editIcons).toHaveLength(0);
            expect(deleteIcons).toHaveLength(0);
        });

        test('hides add task button in read-only mode', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });

            const { container } = render(<KanbanBoard projectId={1} isReadOnly={true} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
            });

            const plusButtons = container.querySelectorAll('button');
            const addButtons = Array.from(plusButtons).filter(btn => btn.textContent.includes('Plus'));
            expect(addButtons).toHaveLength(0);
        });
    });

    describe('Task Creation', () => {
        test('opens modal when add button is clicked', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });

            render(<KanbanBoard projectId={1} isReadOnly={false} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
            });

            const plusIcon = screen.getByTestId('plus-icon');
            fireEvent.click(plusIcon);

            await waitFor(() => {
                expect(screen.getByText('Add New Task')).toBeInTheDocument();
            });
        });

        test('creates task successfully', async () => {
            const user = userEvent.setup();
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });
            tasksAPI.create.mockResolvedValue({ id: 4, title: 'New Task', status: 'To Do' });

            render(<KanbanBoard projectId={1} projectMembers={mockProjectMembers} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
            });

            const plusIcon = screen.getByTestId('plus-icon');
            fireEvent.click(plusIcon);

            await waitFor(() => {
                expect(screen.getByText('Add New Task')).toBeInTheDocument();
            });

            const titleInput = screen.getByPlaceholderText('Enter task title');
            await user.type(titleInput, 'New Task');

            const submitButton = screen.getByRole('button', { name: /Add Task/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(tasksAPI.create).toHaveBeenCalledWith({
                    title: 'New Task',
                    description: '',
                    project_id: 1,
                    status: 'To Do',
                });
            });
        });
    });
});