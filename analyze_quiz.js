import { MongoClient, ObjectId } from 'mongodb';

async function analyzeSpecificUserQuizzes() {
    const uri = "mongodb+srv://user:user@cluster0.jofrcro.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);
    const TARGET_USER_ID = "683009d89d10a0a1c3c12432";

    try {
        await client.connect();
        console.log('Successfully connected to MongoDB');

        const db = client.db('test');
        
        // Get user details
        const user = await db.collection('users').findOne({ 
            $or: [
                { _id: new ObjectId(TARGET_USER_ID) },
                { _id: TARGET_USER_ID }
            ]
        });
        
        console.log('\nAnalyzing for user:', user ? user.name : 'Unknown User');
        console.log('User ID:', TARGET_USER_ID);

        // Fetch all quiz submissions for this user
        const quizSubmissions = await db.collection('quizsubmissions').find({
            userId: TARGET_USER_ID
        }).toArray();

        console.log(`Total quiz submissions found: ${quizSubmissions.length}`);

        // Group submissions by courseUrl
        const submissionsByCourse = {};
        quizSubmissions.forEach(submission => {
            const courseUrl = submission.courseUrl || 'unknown-course';
            if (!submissionsByCourse[courseUrl]) {
                submissionsByCourse[courseUrl] = [];
            }
            submissionsByCourse[courseUrl].push(submission);
        });

        // Analyze each course's submissions
        for (const courseUrl in submissionsByCourse) {
            const courseSubmissions = submissionsByCourse[courseUrl];
            console.log('\n----------------------------------------');
            console.log(`Course: ${courseUrl}`);
            console.log(`Number of submissions: ${courseSubmissions.length}`);

            // Group submissions by quiz (assuming each quiz has a unique ID or name)
            const quizzes = {};
            courseSubmissions.forEach(submission => {
                const quizId = submission.quizId || submission._id;
                if (!quizzes[quizId]) {
                    quizzes[quizId] = [];
                }
                quizzes[quizId].push(submission);
            });

            // Calculate average for each quiz
            let totalQuizAverage = 0;
            let quizCount = 0;

            console.log('\nIndividual Quiz Averages:');
            for (const quizId in quizzes) {
                const quizAttempts = quizzes[quizId];
                const quizScores = quizAttempts.map(attempt => attempt.score || 0);
                const quizAverage = quizScores.reduce((a, b) => a + b, 0) / quizScores.length;
                
                console.log(`Quiz ${quizId}:`);
                console.log(`- Attempts: ${quizAttempts.length}`);
                console.log(`- Scores: ${quizScores.join(', ')}`);
                console.log(`- Average: ${quizAverage.toFixed(2)}%`);
                
                totalQuizAverage += quizAverage;
                quizCount++;
            }

            // Calculate overall course quiz average
            const courseQuizAverage = totalQuizAverage / quizCount;
            console.log('\nCourse Summary:');
            console.log(`Total number of unique quizzes: ${quizCount}`);
            console.log(`Overall course quiz average: ${courseQuizAverage.toFixed(2)}%`);

            // Show all submissions chronologically
            console.log('\nAll submissions chronologically:');
            const sortedSubmissions = courseSubmissions.sort((a, b) => 
                new Date(a.submittedDate) - new Date(b.submittedDate)
            );
            
            sortedSubmissions.forEach((sub, index) => {
                console.log(`${index + 1}. Date: ${sub.submittedDate}`);
                console.log(`   Score: ${sub.score}%`);
                console.log(`   Quiz ID: ${sub.quizId || sub._id}`);
                console.log(`   Completed: ${sub.isCompleted}`);
            });
        }

    } catch (error) {
        console.error('Error analyzing quiz submissions:', error);
    } finally {
        await client.close();
        console.log('\nClosed MongoDB connection');
    }
}

// Run the analysis
console.log('Starting quiz submission analysis...');
analyzeSpecificUserQuizzes()
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    }); 