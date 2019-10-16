package ast;

/**
 * @author GAO RISHENG A0101891L
 * this class is mainly in charge of AST node construction of import statement in C/Java/Python Programs
 */
public class ASTImportStatement extends ASTSimpleStatement{
	private static final String NODE_TYPE = "Import Statement";
	protected ASTExpression packageName;
	public ASTImportStatement(ASTExpression p){
		super();
		this.packageName = p;
		p.addParent(this);
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	public String toSyntax(){
		return this.result;
	}
}
