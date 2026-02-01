BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Tournament] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [createdBy] NVARCHAR(80),
    [updatedBy] NVARCHAR(80),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Tournament_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Tournament_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserAccount] (
    [id] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(80) NOT NULL,
    [passwordHash] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(20) NOT NULL CONSTRAINT [UserAccount_role_df] DEFAULT 'user',
    [access] NVARCHAR(20) NOT NULL CONSTRAINT [UserAccount_access_df] DEFAULT 'read',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserAccount_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserAccount_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserAccount_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[Category] (
    [id] NVARCHAR(1000) NOT NULL,
    [tournamentId] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(20) NOT NULL,
    [count] INT NOT NULL,
    CONSTRAINT [Category_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Category_tournamentId_key_key] UNIQUE NONCLUSTERED ([tournamentId],[key])
);

-- CreateTable
CREATE TABLE [dbo].[MatchTypeConfig] (
    [id] NVARCHAR(1000) NOT NULL,
    [tournamentId] NVARCHAR(1000) NOT NULL,
    [typeKey] NVARCHAR(20) NOT NULL,
    [count] INT NOT NULL,
    CONSTRAINT [MatchTypeConfig_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [MatchTypeConfig_tournamentId_typeKey_key] UNIQUE NONCLUSTERED ([tournamentId],[typeKey])
);

-- CreateTable
CREATE TABLE [dbo].[Team] (
    [id] NVARCHAR(1000) NOT NULL,
    [tournamentId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(80) NOT NULL,
    [owner] NVARCHAR(80),
    CONSTRAINT [Team_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Team_tournamentId_name_key] UNIQUE NONCLUSTERED ([tournamentId],[name])
);

-- CreateTable
CREATE TABLE [dbo].[Player] (
    [id] NVARCHAR(1000) NOT NULL,
    [teamId] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(20) NOT NULL,
    [rank] NVARCHAR(20) NOT NULL,
    [name] NVARCHAR(80),
    CONSTRAINT [Player_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Fixture] (
    [id] NVARCHAR(1000) NOT NULL,
    [tournamentId] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(200) NOT NULL,
    [t1] NVARCHAR(80) NOT NULL,
    [t2] NVARCHAR(80) NOT NULL,
    CONSTRAINT [Fixture_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Fixture_tournamentId_key_key] UNIQUE NONCLUSTERED ([tournamentId],[key])
);

-- CreateTable
CREATE TABLE [dbo].[MatchRow] (
    [id] NVARCHAR(1000) NOT NULL,
    [tournamentId] NVARCHAR(1000) NOT NULL,
    [rowNo] INT NOT NULL,
    [typeKey] NVARCHAR(20) NOT NULL,
    [typeLabel] NVARCHAR(20) NOT NULL,
    [catA] NVARCHAR(20) NOT NULL,
    [catB] NVARCHAR(20) NOT NULL,
    CONSTRAINT [MatchRow_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [MatchRow_tournamentId_rowNo_key] UNIQUE NONCLUSTERED ([tournamentId],[rowNo])
);

-- CreateTable
CREATE TABLE [dbo].[MatchResult] (
    [id] NVARCHAR(1000) NOT NULL,
    [tournamentId] NVARCHAR(1000) NOT NULL,
    [fixtureKey] NVARCHAR(200) NOT NULL,
    [rowNo] INT NOT NULL,
    [t1Player1] NVARCHAR(20),
    [t1Player2] NVARCHAR(20),
    [t2Player1] NVARCHAR(20),
    [t2Player2] NVARCHAR(20),
    [t1Score] INT,
    [t2Score] INT,
    [winner] NVARCHAR(10),
    CONSTRAINT [MatchResult_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [MatchResult_tournamentId_fixtureKey_rowNo_key] UNIQUE NONCLUSTERED ([tournamentId],[fixtureKey],[rowNo])
);

-- AddForeignKey
ALTER TABLE [dbo].[Category] ADD CONSTRAINT [Category_tournamentId_fkey] FOREIGN KEY ([tournamentId]) REFERENCES [dbo].[Tournament]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MatchTypeConfig] ADD CONSTRAINT [MatchTypeConfig_tournamentId_fkey] FOREIGN KEY ([tournamentId]) REFERENCES [dbo].[Tournament]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Team] ADD CONSTRAINT [Team_tournamentId_fkey] FOREIGN KEY ([tournamentId]) REFERENCES [dbo].[Tournament]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Player] ADD CONSTRAINT [Player_teamId_fkey] FOREIGN KEY ([teamId]) REFERENCES [dbo].[Team]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Fixture] ADD CONSTRAINT [Fixture_tournamentId_fkey] FOREIGN KEY ([tournamentId]) REFERENCES [dbo].[Tournament]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MatchRow] ADD CONSTRAINT [MatchRow_tournamentId_fkey] FOREIGN KEY ([tournamentId]) REFERENCES [dbo].[Tournament]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MatchResult] ADD CONSTRAINT [MatchResult_tournamentId_fkey] FOREIGN KEY ([tournamentId]) REFERENCES [dbo].[Tournament]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
