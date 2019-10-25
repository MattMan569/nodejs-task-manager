require('./../src/db/mongoose');
const Task = require('./../src/models/task');

// Task.findByIdAndDelete('5db2336c2385e30954d13b9b').then((task) => {
//     console.log(task);
//     return Task.countDocuments({completed: false});
// }).then((count) => {
//     console.log(count);
// }).catch((e) => {
//     console.log(e);
// });

const deleteTaskAndCount = async (id) => {
    await Task.findByIdAndDelete(id);
    return await Task.countDocuments({completed: false});
};

(async () => {
    try {
        console.log(await deleteTaskAndCount('5db23326b26c403d50bc56d4'));
    } catch (e) {
        console.log(e);
    }
})();
