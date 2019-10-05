package ast;
/**
 * @author GAO RISHENG A0101891L
 * this class is mainly in charge of syntax generation of import statement in Python Programs
 */
public final class ASTImportStatementP extends ASTImportStatement{
	public ASTImportStatementP(ASTExpression p) {
		super(p);
		
	}
	public String toSyntax(){
		this.result = "import ";
		this.result += this.packageName.toSyntax()+"\n";
		return this.result;
	}
}
